import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CarRegistration,
  CarRegistrationDocument,
} from 'src/schemas/Car-Registration.Schema';
import { CreateCarRegistrationDto } from './dto/req/create-car-registration.dto';
import { CarRegistrationResponseDto } from './dto/res/car-registration-response.dto';
import { UpdateCarRegistrationByChassisDto } from './dto/req/update-car-registration.dto';

@Injectable()
export class VehicleRegistrationService {
  constructor(
    @InjectModel(CarRegistration.name)
    private readonly carModel: Model<CarRegistrationDocument>,
  ) {}
  private toResponseDto(
    doc: CarRegistrationDocument,
  ): CarRegistrationResponseDto {
    const { _id, plate, variant, model, year, chassisNumber, image } = doc;
    return {
      //@ts-ignore
      _id,
      plate,
      variant,
      model,
      year,
      chassisNumber,
      image,
    };
  }

  async create(
    dto: CreateCarRegistrationDto,
  ): Promise<CarRegistrationResponseDto> {
    const created = new this.carModel(dto);
    const result = await created.save();
    return this.toResponseDto(result);
  }

async updateByChassisNumber(
  chassisNumber: string,
  dto: UpdateCarRegistrationByChassisDto,
): Promise<CarRegistrationResponseDto> {
  const updated = await this.carModel.findOneAndUpdate(
    { chassisNumber },
    dto,
    { new: true },
  );

  if (!updated) {
    throw new NotFoundException('Car with this chassis number not found');
  }

  return this.toResponseDto(updated);
}

// Elastic-style search
async searchAllFields(keyword: string): Promise<CarRegistrationResponseDto[]> {
  const regex = new RegExp(keyword, 'i'); // Case-insensitive partial match

  const results = await this.carModel.find({
    $or: [
      { plate: regex },
      { variant: regex },
      { model: regex },
      { year: isNaN(Number(keyword)) ? undefined : Number(keyword) },
      { chassisNumber: regex },
    ].filter(Boolean),
  });

  return results.map(this.toResponseDto);
}


}
