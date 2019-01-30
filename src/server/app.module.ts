import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

@Module({
  controllers: [
    // AuthController,
    AppController,
  ],
})
export class ApplicationModule {}
