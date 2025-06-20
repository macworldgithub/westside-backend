import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WorkOrderDocument = WorkOrder & Document;

class MechanicSnapshot {
  @Prop({ required: true })
  name: string;

  @Prop()
  phone?: string;

  @Prop()
  email?: string;

  @Prop()
  deletedAt?: Date;
}

class ShopManagerSnapshot {
  @Prop({ required: true })
  name: string;

  @Prop()
  phone?: string;

  @Prop()
  email?: string;

  @Prop()
  deletedAt?: Date;
}

@Schema({ timestamps: true })
export class WorkOrder {
  @Prop({ type: Types.ObjectId, ref: 'CarRegistration', required: true })
  car: Types.ObjectId;

  @Prop({ required: true })
  ownerName: string;

  @Prop({ required: true })
  headMechanic: string;

  @Prop({ required: true })
  orderCreatorName: string;

  @Prop({ required: true })
  ownerEmail: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  finishDate: Date;

  @Prop({ required: true })
  address: string;

  @Prop({
    required: true,
    enum: ['in_progress', 'completed'],
    default: 'in_progress',
  })
  status: 'in_progress' | 'completed';

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  mechanics: Types.ObjectId[];

  @Prop({ type: [MechanicSnapshot], default: [] })
  mechanicHistory: MechanicSnapshot[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  shopManager: Types.ObjectId[];

  @Prop({ type: [ShopManagerSnapshot], default: [] })
  managerHistory: ShopManagerSnapshot[];
}

export const WorkOrderSchema = SchemaFactory.createForClass(WorkOrder);
