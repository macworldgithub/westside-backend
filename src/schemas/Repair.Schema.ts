import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Repair extends Document {
  @Prop({ type: Types.ObjectId, ref: 'WorkOrder', required: true })
  workOrder: Types.ObjectId;

  @Prop({ required: true })
  partName: string;

  @Prop({ required: true })
  mechanicName: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop()
  finishDate: Date;

  @Prop()
  notes: string;

  @Prop()
  beforeImageUri: string;

   @Prop()
  afterImageUri: string;
}

export const RepairSchema = SchemaFactory.createForClass(Repair);
