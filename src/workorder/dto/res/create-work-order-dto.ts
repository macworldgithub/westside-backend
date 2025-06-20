import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class WorkOrderResponseDto {
  @ApiProperty({ example: '665fabc1234e1b0012abcd89' })
  _id: string;

  @ApiProperty({ example: '665d123abcde001234567890' })
  car: string;

  @ApiProperty({ example: 'Ahmed Ali' })
  ownerName: string;

  @ApiProperty({ example: 'Umar Khan' })
  headMechanic: string;

  @ApiProperty({ example: 'Zain Technician' })
  orderCreatorName: string;

  @ApiProperty({ example: 'ahmed.ali@example.com' })
  ownerEmail: string;

  @ApiProperty({ example: '03001234567' })
  phoneNumber: string;

  @ApiProperty({ example: '2025-06-21T10:00:00.000Z' })
  startDate: string;

  @ApiProperty({ example: '2025-06-25T18:00:00.000Z' })
  finishDate: string;

  @ApiProperty({ example: '12-A Gulberg, Lahore' })
  address: string;

  @ApiProperty({ example: 'in_progress', enum: ['in_progress', 'completed'] })
  status: 'in_progress' | 'completed';

  @ApiProperty({ example: '665d123abcde001234566789' })
  createdBy: string;

  @ApiProperty({ example: [], description: 'List of active mechanic IDs' })
  mechanics: string[];

  @ApiProperty({
    example: [],
    description: 'Archived mechanic info for those who were deleted',
  })
  mechanicHistory: {
    name: string;
    phone?: string;
    email?: string;
    deletedAt?: string;
  }[];

  @ApiProperty({ example: [], description: 'List of active shop manager IDs' })
  shopManager: string[];

  @ApiProperty({
    example: [],
    description: 'Archived shop manager info for those who were deleted',
  })
  managerHistory: {
    name: string;
    phone?: string;
    email?: string;
    deletedAt?: string;
  }[];

  @ApiProperty({ example: '2025-06-21T12:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2025-06-21T12:00:00.000Z' })
  updatedAt: string;
}
