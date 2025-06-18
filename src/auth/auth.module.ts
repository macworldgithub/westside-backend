import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from './auth.service';
import { RolesGuard } from './roles.guard';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { User, UserSchema } from 'src/schemas/User.Schemas';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    JwtModule.register({
      secret: 'secret', // 🔐 Use process.env.SECRET
      signOptions: { expiresIn: '1d' },
    }),

    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),

    UserModule,
  ],
  providers: [AuthService, JwtStrategy, RolesGuard, UserService],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
