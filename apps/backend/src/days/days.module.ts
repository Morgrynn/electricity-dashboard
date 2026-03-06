import { Module } from '@nestjs/common';
import { DaysService } from './days.service';
import { DaysController } from './days.controller';
import { DaysRepository } from './days.repository';
import { DbModule } from '../common/db/db.module';

@Module({
  imports: [DbModule],
  controllers: [DaysController],
  providers: [DaysService, DaysRepository],
})
export class DaysModule {}
