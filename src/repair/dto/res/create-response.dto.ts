export class RepairResponseDto {
  _id: string;
  workOrder: string;
  mechanicName: string;
  partName: string;
  price: number;
  finishDate: Date;
  notes?: string;
  beforeImageUrl?: string;
  afterImageUrl?: string;
  submitted: boolean;
}
