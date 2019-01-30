import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { Connection } from 'typeorm';
import { AppController } from './app.controller';
import { DBModule } from './util/db';

@Module({
  imports: [DBModule],
  controllers: [
    // AuthController,
    AppController,
  ],
})
export class ApplicationModule implements NestModule {
  constructor(private readonly connection: Connection) {}

  configure() {
    if (process.env.DB_SYNC === 'true') {
      this.connection.synchronize();
    }
  }
}
