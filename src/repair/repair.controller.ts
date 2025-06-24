// repair.controller.ts
import {
  Controller,
  Post,
  Body,
  UploadedFiles,
  UseInterceptors,
  Get,
  Query,
  Param,
  Put,
  UploadedFile,
  ParseFilePipe,
  Delete,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

import { RepairService } from './repair.service';
import {
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateRepairDto } from './dto/req/create-repair.dto';
import { UpdateRepairDto } from './dto/req/update-repair.dto';
import { RepairResponseDto } from 'd:/westside-backend/src/repair/dto/res/create-response.dto';

@Controller('repairs')
export class RepairController {
  constructor(private readonly repairService: RepairService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new repair with optional images' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images', 2))
  @ApiBody({
    description: 'Repair data and optional before/after images',
    schema: {
      type: 'object',
      properties: {
        workOrder: { type: 'string', example: '665d...' },
        mechanicName: { type: 'string', example: 'Ali' },
        partName: { type: 'string', example: 'Window Glass' },
        price: { type: 'number', example: 2000 },
        finishDate: { type: 'string', example: '2025-07-01T10:00:00Z' },
        notes: { type: 'string', example: 'Replaced broken glass' },
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Upload 2 images: first for before, second for after',
        },
      },
    },
  })
  async createRepair(
    @Body() dto: CreateRepairDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const [beforeImage, afterImage] = files || [];
    return this.repairService.createRepair(dto, beforeImage, afterImage);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a repair (only if not submitted)' })
  @ApiParam({ name: 'id', required: true, description: 'Repair ID' })
  @ApiQuery({ name: 'userId', required: true, description: 'User ID' })
  @ApiBody({ type: UpdateRepairDto })
  async updateRepair(
    @Param('id') id: string,
    @Query('userId') userId: string,
    @Body() dto: UpdateRepairDto,
  ): Promise<RepairResponseDto> {
    return this.repairService.updateRepair(id, dto, userId);
  }

  @Get('workorder/:workOrderId')
  @ApiQuery({ name: 'mechanicName', required: false })
  @ApiQuery({ name: 'partName', required: false })
  @ApiQuery({ name: 'submitted', required: false, type: Boolean })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getRepairs(
    @Param('workOrderId') workOrderId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query() filters: any,
  ): Promise<{
    data: import('d:/westside-backend/src/repair/dto/res/create-response.dto').RepairResponseDto[];
    total: number;
  }> {
    return this.repairService.getAllRepairs(
      workOrderId,
      parseInt(page),
      parseInt(limit),
      {
        mechanicName: filters.mechanicName,
        partName: filters.partName,
        submitted: filters.submitted === 'true',
        startDate: filters.startDate,
        endDate: filters.endDate,
      },
    );
  }

  @Put('upload-image/:repairId/:type/:userId')
  @ApiOperation({ summary: 'Upload repair image (before/after)' })
  @ApiParam({ name: 'repairId', description: 'Repair ID' })
  @ApiParam({
    name: 'type',
    enum: ['before', 'after'],
    description: 'Image type',
  })
  @ApiParam({ name: 'userId', description: 'User performing the upload' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadImage(
    @Param('repairId') repairId: string,
    @Param('type') type: 'before' | 'after',
    @Param('userId') userId: string,
    @UploadedFile(new ParseFilePipe({ fileIsRequired: true }))
    file: Express.Multer.File,
  ) {
    return this.repairService.uploadRepairImage(repairId, userId, file, type);
  }

  // ❌ Delete Image
  @Delete('delete-image/:repairId/:type/:userId')
  @ApiOperation({ summary: 'Delete repair image (before/after)' })
  @ApiParam({ name: 'repairId', description: 'Repair ID' })
  @ApiParam({
    name: 'type',
    enum: ['before', 'after'],
    description: 'Image type',
  })
  @ApiParam({ name: 'userId', description: 'User performing the delete' })
  async deleteImage(
    @Param('repairId') repairId: string,
    @Param('type') type: 'before' | 'after',
    @Param('userId') userId: string,
  ) {
    return this.repairService.deleteRepairImage(repairId, userId, type);
  }

  @Get(':id/allowed')
  @ApiOperation({
    summary: 'Get a work order and its repairs (with permission check)',
  })
  @ApiParam({
    name: 'id',
    example: '665b27f014c4b63a1fbe0033',
    description: 'Work order ID',
  })
  @ApiQuery({
    name: 'userId',
    example: '665a99c08a01d6334c46c1a2',
    description: 'Requesting user ID',
  })
  @ApiResponse({ status: 200, description: 'Work order with related repairs' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden if user is not authorized',
  })
  @ApiResponse({ status: 404, description: 'Work order or user not found' })
  async getWorkOrderRepairs(
    @Param('id') workOrderId: string,
    @Query('userId') userId: string,
  ) {
    return this.repairService.getRepairsByIdWithPermission(workOrderId, userId);
  }

  @Get('get-single-repair-by-id/:id')
  @ApiOperation({ summary: 'Get repair by ID with signed image URLs' })
  @ApiParam({
    name: 'id',
    example: '665e99d4e5f1a6c123456789',
    description: 'Repair MongoDB ObjectId',
  })
  @ApiResponse({
    status: 200,
    description:
      'Repair found and returned with signed URLs for images (if any)',
    
  })
  @ApiResponse({ status: 404, description: 'Repair not found' })
  async getRepairById(@Param('id') id: string): Promise<any> {
    return this.repairService.getSingleRepairById(id);
  }
}
