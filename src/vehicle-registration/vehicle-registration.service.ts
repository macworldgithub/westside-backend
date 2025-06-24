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
import { WorkOrder, WorkOrderDocument } from 'src/schemas/Work-Order.Schema';
import { Role } from 'src/auth/roles.enum';
import { User, UserDocument } from 'src/schemas/User.Schemas';

@Injectable()
export class VehicleRegistrationService {
  constructor(
    @InjectModel(CarRegistration.name)
    private readonly carModel: Model<CarRegistrationDocument>,
    @InjectModel(WorkOrder.name)
    private workOrderModel: Model<WorkOrderDocument>,
    private readonly awsService: AwsService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
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
    console.log(dto);
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

  async getRegisteredCarsForUser(
    userId: string,
    page = 1,
    limit = 20,
    search?: string,
  ): Promise<{ data: ResRegisteredCarDto[]; total: number }> {
    const user = await this.userModel.findById(userId);

    if (!user) throw new NotFoundException('User not found');

    const role = user.role;
    const skip = (page - 1) * limit;

    const searchQuery: any = {};

    if (search) {
      const regex = new RegExp(search, 'i');
      searchQuery.$or = [
        { plate: regex },
        { variant: regex },
        { model: regex },
        { chassisNumber: regex },
      ];
    }

    // ✅ Admin/Shop Manager: all cars
    if (role === Role.ShopManager || role === Role.SystemAdministrator) {
      const [cars, total] = await Promise.all([
        this.carModel.find(searchQuery).skip(skip).limit(limit),
        this.carModel.countDocuments(searchQuery),
      ]);

      const data: ResRegisteredCarDto[] = await Promise.all(
        cars.map(async (car) => ({
          _id: car._id.toString(),
          chassisNumber: car.chassisNumber,
          plate: car.plate,
          variant: car.variant,
          model: car.model,
          year: car.year,
          image: car.image ? await this.awsService.getSignedUrl(car.image) : '',
        })),
      );

      return { data, total };
    }

    // 🔒 Technician: only assigned cars
    const workOrders = await this.workOrderModel.find({ mechanics: userId });
    const carIds = workOrders.map((wo) => wo.car);

    const query = {
      _id: { $in: carIds },
      ...searchQuery,
    };

    const [cars, total] = await Promise.all([
      this.carModel.find(query).skip(skip).limit(limit),
      this.carModel.countDocuments(query),
    ]);

    console.log(cars, 'hehe');

    const data: ResRegisteredCarDto[] = await Promise.all(
      cars.map(async (car) => ({
        _id: car._id.toString(),
        chassisNumber: JSON.stringify(car.chassisNumber),
        plate: car.plate,
        variant: car.variant,
        model: car.model,
        year: car.year,
        image: car.image ? await this.awsService.getSignedUrl(car.image) : '',
      })),
    );

    return { data, total };
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
