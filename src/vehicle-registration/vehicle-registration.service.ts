import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CarRegistration,
  CarRegistrationDocument,
} from 'src/schemas/Car-Registration.Schema';
import { CreateCarRegistrationDto } from './dto/req/create-car-registration.dto';
import { CarRegistrationResponseDto } from './dto/res/car-registration-response.dto';
import { UpdateCarRegistrationByChassisDto } from './dto/req/update-car-registration.dto';
import { AwsService } from 'src/aws/aws.service';
import { ReqCarImageDto } from './dto/req/upload-car-image-dto';
import { ResCarImageDto } from './dto/res/uplaod-car-image-dto';
import { ReqRegisteredCarDto } from './dto/req/get-registered-car-dto';
import { ResRegisteredCarDto } from './dto/res/get-registered-car-dto';

@Injectable()
export class VehicleRegistrationService {
  constructor(
    @InjectModel(CarRegistration.name)
    private readonly carModel: Model<CarRegistrationDocument>,

    private readonly awsService: AwsService,
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

  async getRegisteredCar(
    getRegisteredCar: ReqRegisteredCarDto,
  ): Promise<ResRegisteredCarDto> {
    const { chassisNumber } = getRegisteredCar;

    try {
      const car = await this.carModel.findOne({ chassisNumber });

      if (!car) {
        throw new Error('Car not found with this chassis number');
      }

      return {
        _id: car._id.toString(),
        chassisNumber: car.chassisNumber,
        plate: JSON.parse(car.plate),
        variant: JSON.parse(car.variant),
        model: JSON.parse(car.model),
        year: car.year,
        image: await this.awsService.getSignedUrl(car.image),
      };
    } catch (error) {
      console.error('Error fetching registered car:', error);
      throw new Error(
        error.message || 'Something went wrong while retrieving the car',
      );
    }
  }

  // Elastic-style search
  async searchAllFields(
    keyword: string,
  ): Promise<CarRegistrationResponseDto[]> {
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

    // Replace image key with signed URL
    for (const item of results) {
      if (item.image) {
        item.image = await this.awsService.getSignedUrl(item.image);
      }
    }

    return results.map(this.toResponseDto);
  }

  async findByChassisNumber(chassisNumber: string) {
    return this.carModel.findOne({ chassisNumber });
  }

  async deleteCarImage(chassisNumber: string): Promise<string> {
    try {
      const car = await this.carModel.findOne({ chassisNumber });

      if (!car) {
        return 'Car not found';
      }

      if (!car.image) {
        return 'No image found for this car';
      }

      const deleted = await this.awsService.deleteFile(car.image);

      if (deleted) {
        await this.carModel.findOneAndUpdate({ chassisNumber }, { image: '' });
        return 'Image successfully deleted';
      } else {
        return 'Failed to delete image from AWS';
      }
    } catch (error) {
      console.error('Error deleting car image:', error);
      return 'Internal server error while deleting image';
    }
  }

  async uploadCarImage(
    reqCarImageDto: ReqCarImageDto,
    image: Express.Multer.File,
  ): Promise<ResCarImageDto> {
    try {
      const { chassisNumber } = reqCarImageDto;

      const key = await this.awsService.uploadFile(
        image.buffer,
        image.originalname,
        'cars',
        image.mimetype,
      );

      await this.carModel.findOneAndUpdate({ chassisNumber }, { image: key });

      const signedUrl = await this.awsService.getSignedUrl(key);

      return {
        status: 'Image Successfully Added',
        image: signedUrl,
      };
    } catch (error) {
      console.error('Upload Error:', error);
      throw new BadRequestException('Failed to upload image');
    }
  }
}
