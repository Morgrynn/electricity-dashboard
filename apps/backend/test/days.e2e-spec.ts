import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { DayHour } from '../src/days/days.model';

type ErrorResponseBody = {
  message: string;
};

describe('DaysController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /api/days/:date/hours returns 400 for invalid date', async () => {
    await request(app.getHttpServer())
      .get('/api/days/2024-99-99/hours')
      .expect(400)
      .expect((res) => {
        const body = res.body as ErrorResponseBody;
        expect(body.message).toBe(
          'Date must be a valid date in format YYYY-MM-DD',
        );
      });
  });

  it('GET /api/days/:date/hours returns 404 when day does not exist', async () => {
    await request(app.getHttpServer())
      .get('/api/days/2099-01-01/hours')
      .expect(404)
      .expect((res) => {
        const body = res.body as ErrorResponseBody;
        expect(body.message).toBe('No hourly data for date 2099-01-01');
      });
  });

  it('GET /api/days/:date/hours returns hourly rows for existing day', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/days/2024-08-24/hours')
      .expect(200);

    const body = res.body as DayHour[];

    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);

    expect(typeof body[0].startTime).toBe('string');
    expect(body[0]).toHaveProperty('consumptionMWh');
    expect(body[0]).toHaveProperty('productionMWh');
    expect(body[0]).toHaveProperty('priceEurPerMWh');
  });
});
