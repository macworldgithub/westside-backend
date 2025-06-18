export class CarRegistrationResponseDto {
  _id: string;
  plate: string;
  variant: string;
  model: string;
  year: number;
  chassisNumber: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}
