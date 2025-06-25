// src/auth/dto/login-response.dto.ts
import { Role } from 'src/auth/roles.enum';

export class LoginResponseDto {
  _id: string;
  name:string;
  email: string;
  role: Role;
  token: string;
}
