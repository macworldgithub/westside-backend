import { Test, TestingModule } from '@nestjs/testing';
import { WorkorderController } from './workorder.controller';

describe('WorkorderController', () => {
  let controller: WorkorderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkorderController],
    }).compile();

    controller = module.get<WorkorderController>(WorkorderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
