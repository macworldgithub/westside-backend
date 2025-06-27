import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { Roles } from 'src/auth/roles.decorator';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

class SendReportEmailDto {
  email: string;
}

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

  @Post(':workOrderId/send-email')
  @ApiOperation({ summary: 'Send work order report as PDF to email' })
  @ApiParam({
    name: 'workOrderId',
    description: 'Work Order MongoDB ID',
    required: true,
  })
  @ApiBody({
    type: SendReportEmailDto,
    description: 'Email object',
  })
  @ApiResponse({ status: 201, description: 'Email sent successfully' })
  @ApiResponse({ status: 404, description: 'Work order not found' })
  async sendEmailReport(
    @Param('workOrderId') workOrderId: string,
    @Body() body: SendReportEmailDto,
  ): Promise<{ message: string }> {
    if (!body.email) {
      throw new NotFoundException('Recipient email is required');
    }

    const result = await this.reportService.sendReportEmail(
      workOrderId,
      body.email,
    );

    return { message: result };
  }
}
