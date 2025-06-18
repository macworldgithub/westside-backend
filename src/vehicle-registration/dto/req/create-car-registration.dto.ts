export class CreateCarRegistrationDto {
  plate: string;
  variant: string;
  model: string;
  year: number;
  chassisNumber: string;
  image?: string;
}
