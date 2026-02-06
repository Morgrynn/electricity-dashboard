import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  dotenv.config({ path: join(__dirname, '../../..', '.env') });

  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);

  console.log(`Backend listening on port ${port} (prefix /api)`);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
