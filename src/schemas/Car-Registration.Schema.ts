import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CarRegistrationDocument = CarRegistration & Document;

@Schema({ timestamps: true })
export class CarRegistration {
  @Prop({ required: true, unique: true })
  plate: string;

  @Prop({ required: true })
  variant: string;

  @Prop({ required: true })
  model: string;

  @Prop({ required: true })
  year: number;

  @Prop({ required: true, unique: true })
  chassisNumber: string;

  @Prop()
  image: string; // Can be a URL or file path

  
}

export const CarRegistrationSchema =
  SchemaFactory.createForClass(CarRegistration);
