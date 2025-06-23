import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RepairDocument = Repair & Document;

@Schema({ timestamps: true })
export class Repair {
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

  @Prop({ default: false }) // 🔒 Prevents further updates when true
  submitted: boolean;
}

export const RepairSchema = SchemaFactory.createForClass(Repair);
