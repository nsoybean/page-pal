import { Module } from '@nestjs/common';
import { AppController } from './app/app.controller';
import { AppService } from './app/app.service';
import { SavesModule } from './saves/saves.module';
import { MongooseModule } from '@nestjs/mongoose';
import 'dotenv/config';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI, { dbName: 'page-pal' }),
    SavesModule,
  ],
  controllers: [AppController], // handles HTTP requests
  providers: [AppService], // perform complex tasks
})
export class AppModule {}
