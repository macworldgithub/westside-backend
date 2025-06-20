// src/user/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from 'src/auth/roles.enum';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string; // should be hashed

  @Prop({ enum: Role, required: true })
  role: Role;

  @Prop({required:true})
  mobile:number

  @Prop({required:true})
  address:string
}

export const UserSchema = SchemaFactory.createForClass(User);
