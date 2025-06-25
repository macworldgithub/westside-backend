// dto/update-user-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Role } from 'src/auth/roles.enum';


export class UpdateUserResponseDto {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  role: Role;

  @ApiProperty()
  mobile: string;

  @ApiProperty()
  address: string;
}
