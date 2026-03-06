import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DaysService } from './days.service';
import { DaysRepository } from './days.repository';

describe('DaysService', () => {
  let service: DaysService;
  let repo: { getDaySummary: jest.Mock };

  beforeEach(async () => {
    repo = {
      getDaySummary: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DaysService,
        {
          provide: DaysRepository,
          useValue: repo,
        },
      ],
    }).compile();

    service = module.get<DaysService>(DaysService);
  });

  it('returns summary when repository returns data', async () => {
    repo.getDaySummary.mockResolvedValue({
      date: '2021-01-01',
      totalConsumptionMWh: 0,
      totalProductionMWh: 100,
      avgPriceEurPerMWh: 3.1,
      longestNegativeStreakHours: 0,
      maxConsumptionVsProductionHour: null,
      cheapestHours: [],
    });

    await expect(service.getSummary('2021-01-01')).resolves.toEqual(
      expect.objectContaining({ date: '2021-01-01' }),
    );
    expect(repo.getDaySummary).toHaveBeenCalledWith('2021-01-01', 3);
  });

  it('throws NotFoundException when no summary exists', async () => {
    repo.getDaySummary.mockResolvedValue(null);

    await expect(service.getSummary('2021-01-01')).rejects.toThrow(
      NotFoundException,
    );
  });
});
