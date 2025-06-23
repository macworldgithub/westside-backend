import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { CreateWorkOrderDto } from './dto/req/create-work-order-dto';
import { WorkorderService } from './workorder.service';
import { WorkOrder } from 'src/schemas/Work-Order.Schema';
import { WorkOrderResponseDto } from './dto/res/create-work-order-dto';
import { UserWorkOrdersQueryDto } from './dto/req/user-work-order-dto';
import { UpdateWorkOrderDto } from './dto/req/update-work-order-dto';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Work Orders')
@Controller('workorder')
export class WorkorderController {
  constructor(private readonly workOrderService: WorkorderService) {}

  @Post('create-work-order')
  @ApiOperation({ summary: 'Create a new work order' })
  @ApiBody({ type: CreateWorkOrderDto })
  @ApiResponse({
    status: 201,
    description: 'Work order created',
    type: WorkOrder,
  })
  async createWorkOrder(
    @Body() dto: CreateWorkOrderDto,
    @Req() req: any,
  ): Promise<WorkOrder> {
    return this.workOrderService.createWorkOrder(dto, req.user.role);
  }

  @Put('add-mechanic/:workOrderId/:mechanicId')
  @ApiOperation({ summary: 'Add mechanic to a work order' })
  @ApiParam({ name: 'workOrderId', example: '665d123abcde001234567890' })
  @ApiParam({ name: 'mechanicId', example: '665d123abcde001234567891' })
  async addMechanic(
    @Param('workOrderId') workOrderId: string,
    @Param('mechanicId') mechanicId: string,
  ) {
    return this.workOrderService.addMechanicToWorkOrder(
      workOrderId,
      mechanicId,
    );
  }

  @Put('add-manager/:workOrderId/:managerId')
  @ApiOperation({ summary: 'Add manager to a work order' })
  @ApiParam({ name: 'workOrderId', example: '665d123abcde001234567890' })
  @ApiParam({ name: 'managerId', example: '665d123abcde001234567892' })
  async addManager(
    @Param('workOrderId') workOrderId: string,
    @Param('managerId') managerId: string,
  ) {
    return this.workOrderService.addManagerToWorkOrder(workOrderId, managerId);
  }

  @Delete('delete-mechanic/:id')
  @ApiOperation({
    summary: 'Delete a mechanic from all work orders and archive',
  })
  @ApiParam({ name: 'id', example: '665d123abcde001234567891' })
  async deleteMechanic(@Param('id') id: string) {
    return this.workOrderService.deleteMechanicFromWorkOrders(id);
  }

  @Delete('delete-manager/:id')
  @ApiOperation({
    summary: 'Delete a manager from all work orders and archive',
  })
  @ApiParam({ name: 'id', example: '665d123abcde001234567892' })
  async deleteManager(@Param('id') id: string) {
    return this.workOrderService.deleteManagerFromWorkOrders(id);
  }

  @Get('by-mechanic')
  @ApiOperation({
    summary: 'Get work orders assigned to a mechanic (filtered)',
  })
  @ApiQuery({ name: 'userId', required: true })
  @ApiQuery({ name: 'carId', required: false }) // ✅ vehicle-based filtering
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['in_progress', 'completed'],
  })
  @ApiQuery({ name: 'startDate', required: false, example: '2025-06-01' })
  @ApiQuery({ name: 'endDate', required: false, example: '2025-06-30' })
  @ApiQuery({ name: 'search', required: false })
  async getMechanicOrders(@Query() query: UserWorkOrdersQueryDto) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '20', 10);

    if (query.carId) {
      return this.workOrderService.getFilteredWorkOrdersByRoleWithinVehicle(
        query.carId,
        query.userId,
        Role.Technician,
        page,
        limit,
        {
          status: query.status,
          startDate: query.startDate,
          endDate: query.endDate,
          search: query.search,
        },
      );
    }

    return this.workOrderService.getFilteredWorkOrdersByRole(
      query.userId,
      Role.Technician,
      page,
      limit,
      {
        status: query.status,
        startDate: query.startDate,
        endDate: query.endDate,
        search: query.search,
      },
    );
  }

  @Get('by-manager')
  @ApiOperation({
    summary: 'Get work orders managed by a manager (filtered)',
  })
  @ApiQuery({ name: 'userId', required: true })
  @ApiQuery({ name: 'carId', required: false }) // ✅ vehicle-based filtering
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['in_progress', 'completed'],
  })
  @ApiQuery({ name: 'startDate', required: false, example: '2025-06-01' })
  @ApiQuery({ name: 'endDate', required: false, example: '2025-06-30' })
  @ApiQuery({ name: 'search', required: false })
  async getManagerOrders(@Query() query: UserWorkOrdersQueryDto) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '20', 10);

    if (query.carId) {
      return this.workOrderService.getFilteredWorkOrdersByRoleWithinVehicle(
        query.carId,
        query.userId,
        Role.ShopManager,
        page,
        limit,
        {
          status: query.status,
          startDate: query.startDate,
          endDate: query.endDate,
          search: query.search,
        },
      );
    }

    return this.workOrderService.getFilteredWorkOrdersByRole(
      query.userId,
      Role.ShopManager,
      page,
      limit,
      {
        status: query.status,
        startDate: query.startDate,
        endDate: query.endDate,
        search: query.search,
      },
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a work order by ID' })
  @ApiParam({ name: 'id', example: '665d123abcde001234567890' })
  @ApiBody({ type: UpdateWorkOrderDto })
  @ApiResponse({
    status: 200,
    description: 'Work order updated',
    type: WorkOrder,
  })
  async updateWorkOrder(
    @Param('id') id: string,
    @Body() body: UpdateWorkOrderDto,
  ): Promise<WorkOrder> {
    return this.workOrderService.updateWorkOrder(id, body);
  }
}
