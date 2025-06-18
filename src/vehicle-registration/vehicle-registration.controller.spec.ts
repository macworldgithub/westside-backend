import { Test, TestingModule } from '@nestjs/testing';
import { VehicleRegistrationController } from './vehicle-registration.controller';

describe('VehicleRegistrationController', () => {
  let controller: VehicleRegistrationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VehicleRegistrationController],
    }).compile();

    controller = module.get<VehicleRegistrationController>(VehicleRegistrationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
