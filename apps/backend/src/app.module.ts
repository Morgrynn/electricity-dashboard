import { Module } from '@nestjs/common';
import { DbModule } from './db/db.module';
import { HealthController } from './health.controller';
import { MetaController } from './meta/meta.controller';

@Module({
  imports: [DbModule],
  controllers: [HealthController, MetaController],
})
export class AppModule {}
