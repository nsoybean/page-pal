import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SavesController } from './saves.controller';
import { SavesService } from './saves.service';
import { Save, SaveSchema } from './schemas/save.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Save.name, schema: SaveSchema }]),
  ],
  controllers: [SavesController],
  providers: [SavesService],
})
export class SavesModule {}
