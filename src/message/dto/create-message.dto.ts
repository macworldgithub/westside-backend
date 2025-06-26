import {
  IsString,
  IsOptional,
  IsArray,
  IsMongoId,
  ArrayNotEmpty,
} from 'class-validator';

export class CreateMessageDto {
  @IsMongoId()
  chatRoomId: string;

  @IsMongoId()
  sender: string;

  @IsOptional()
  @IsString()
  text?: string;
}
