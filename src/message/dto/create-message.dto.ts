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

  @IsOptional()
  @IsArray()
  imageUrls?: string[];

  @IsOptional()
  @IsArray()
  videoUrls?: string[];

  @IsOptional()
  @IsArray()
  fileUrls?: string[];

  @IsOptional()
  @IsArray()
  fileNames?: string[];

  @IsOptional()
  @IsString()
  audioUrl?: string;
}
