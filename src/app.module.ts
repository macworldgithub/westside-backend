import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { VehicleRegistrationModule } from './vehicle-registration/vehicle-registration.module';
import { AwsModule } from './aws/aws.module';
import { WorkorderModule } from './workorder/workorder.module';
import { RepairModule } from './repair/repair.module';
import { ReportModule } from './report/report.module';
import { ChatModule } from './chat/chat.module';
import { MessageModule } from './message/message.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule, AuthModule, UserModule, VehicleRegistrationModule, AwsModule, WorkorderModule, RepairModule, ReportModule, ChatModule, MessageModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
