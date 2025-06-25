import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Res,
} from '@nestjs/common';
import { ReportService } from './report.service';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

   @Get('get-report-workorder/:workOrderId')
  async downloadPdf(
    @Param('workOrderId') workOrderId: string,
    @Res() res: Response,
  ) {
    try {
      const pdfBuffer = await this.reportService.generatePdf(workOrderId);
        //@ts-ignore
      res.setHeader('Content-Type', 'application/pdf');
      //@ts-ignore
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="repair_report.pdf"',
      );
      //@ts-ignore
      res.end(pdfBuffer); // ✅ Send PDF as binary
    } catch (err) {
      console.error('❌ PDF Generation Error:', err);
      throw new HttpException(
        'PDF generation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
