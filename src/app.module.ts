import { Module } from '@nestjs/common';
import { AppController } from './app/app.controller';
import { AppService } from './app/app.service';
import { SavesController } from './saves/saves.controller';
import { SavesService } from './saves/saves.service';

@Module({
  imports: [],
  controllers: [AppController, SavesController], // handles HTTP requests
  providers: [AppService, SavesService], // perform complex tasks
})
export class AppModule {}
