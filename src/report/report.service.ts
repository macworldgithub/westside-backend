import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as path from 'path';
import * as ejs from 'ejs';
import * as puppeteer from 'puppeteer';
import { InjectModel } from '@nestjs/mongoose';
import { WorkOrder, WorkOrderDocument } from 'src/schemas/Work-Order.Schema';
import { Repair, RepairDocument } from 'src/schemas/Repair.Schema';
import { Model, Types } from 'mongoose';

import {
  CarRegistration,
  CarRegistrationDocument,
} from 'src/schemas/Car-Registration.Schema';
import { User, UserDocument } from 'src/schemas/User.Schemas';
import { AwsService } from 'src/aws/aws.service';
import axios from 'axios';

@Injectable()
export class ReportService {
  constructor(
    @InjectModel(Repair.name) private repairModel: Model<RepairDocument>,
    private readonly awsService: AwsService,

    @InjectModel(WorkOrder.name)
    private workOrderModel: Model<WorkOrderDocument>,
  ) {}

  async getBase64Image(url: string): Promise<string> {
    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const mimeType = response.headers['content-type'];
      const base64 = Buffer.from(response.data).toString('base64');
      return `data:${mimeType};base64,${base64}`;
    } catch (error) {
      console.warn(`⚠️ Failed to fetch image at ${url}: ${error.message}`);
      // Return placeholder or empty base64
      return ''; // OR: return base64 for a default image
    }
  }

  async generatePdf(workOrderId: string): Promise<Buffer> {
    if (!Types.ObjectId.isValid(workOrderId)) {
      throw new NotFoundException('Invalid work order ID');
    }

    const workOrder = await this.workOrderModel
      .findById(workOrderId)
      .populate('car')
      .populate('mechanics')
      .populate('shopManager');

    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }

    // if (workOrder.status === 'in_progress') {
    //   throw new ForbiddenException(
    //     'You cant download PDF Because work is going on',
    //   );
    // }

    const repairs = await this.repairModel.find({
      workOrder: workOrder._id,
    });

    // 🧠 Prepare dynamic data
    const data = {
      workOrder: {
        id: workOrder._id.toString(),
        //@ts-ignore
        carName: `${workOrder.car?.model} ${workOrder.car?.variant} ${workOrder.car?.year}`,
        //@ts-ignore
        carImage: await this.getBase64Image(
          //@ts-ignore
          workOrder.car?.image
            ? //@ts-ignore
              await this.awsService.getSignedUrl(workOrder.car.image)
            : '',
        ),
      },
      owner: {
        name: workOrder.ownerName,
        email: workOrder.ownerEmail,
        phone: workOrder.phoneNumber,
      },
      //@ts-ignore
      managers: workOrder.shopManager?.map((m) => m.name) || [],
      //@ts-ignore
      mechanics: workOrder.mechanics?.map((m) => m.name) || [],
      repairs: await Promise.all(
        repairs.map(async (r) => ({
          part: r.partName,
          mechanic: r.mechanicName,
          price: r.price,
          date: r.finishDate?.toISOString().split('T')[0],
          notes: r.notes || '',
          beforeImage: await this.getBase64Image(
            r.beforeImageUri
              ? await this.awsService.getSignedUrl(r.beforeImageUri)
              : '',
          ),
          afterImage: await this.getBase64Image(
            r.afterImageUri
              ? await this.awsService.getSignedUrl(r.afterImageUri)
              : '',
          ),
        })),
      ),
      generatedDate: new Date().toLocaleDateString(),
    };

    const templatePath = path.join(process.cwd(), 'views', 'report.ejs');
    const html = await ejs.renderFile(templatePath, data);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    );

    await page.setViewport({ width: 1280, height: 800 });

    await page.evaluate(async () => {
      const selectors = Array.from(document.images);
      await Promise.all(
        selectors.map((img) => {
          if (img.complete) return;
          return new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
        }),
      );
    });

    const pdfUint8 = await page.pdf({
      format: 'A4',
      printBackground: true,
    });

    await browser.close();
    return Buffer.from(pdfUint8);
  }
}
