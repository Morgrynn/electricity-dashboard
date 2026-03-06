import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DaysController } from './days.controller';
import { DaysService } from './days.service';

describe('DaysController', () => {
  let controller: DaysController;
  let service: { getSummary: jest.Mock };

  beforeEach(async () => {
    service = {
      getSummary: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DaysController],
      providers: [
        {
          provide: DaysService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<DaysController>(DaysController);
  });

  it('forwards valid date to service', async () => {
    service.getSummary.mockResolvedValue({ date: '2021-01-01' });

    await controller.getSummary('2021-01-01');

    expect(service.getSummary).toHaveBeenCalledWith('2021-01-01');
  });

  it('rejects invalid date format', async () => {
    await expect(controller.getSummary('2021-99-99')).rejects.toThrow(
      BadRequestException,
    );
  });
});
