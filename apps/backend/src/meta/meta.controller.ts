import { Controller, Get } from '@nestjs/common';
import { DbService } from '../db/db.service';

@Controller('meta')
export class MetaController {
  constructor(private readonly db: DbService) {}

  @Get()
  async meta() {
    const rows = await this.db.query<{ count: string }>(
      'SELECT COUNT(*)::text AS count FROM "electricitydata"',
    );

    return {
      db: 'ok',
      table: 'electricitydata',
      rowCount: Number(rows[0]?.count ?? 0),
    };
  }
}
