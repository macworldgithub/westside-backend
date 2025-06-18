// src/user/dto/create-user-response.dto.ts
import { Role } from 'src/auth/roles.enum';

export class CreateUserResponseDto {
  _id: string;
  name: string;
  email: string;
  role: Role;
}
