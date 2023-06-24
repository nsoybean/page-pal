import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SavesController } from './saves.controller';
import { SavesService } from './saves.service';
import { Save, SaveSchema } from './schemas/save.schema';
import { ClsModule } from 'nestjs-cls';

@Module({
  imports: [
    ClsModule.forRoot({
      middleware: {
        // automatically mount the
        // ClsMiddleware for all routes
        mount: true,
        // and use the setup method to
        // provide default store values.
        setup: (cls, req) => {
          cls.set('ctx', req);
        },
      },
    }),
    MongooseModule.forFeature([{ name: Save.name, schema: SaveSchema }]),
  ],
  controllers: [SavesController],
  providers: [SavesService],
})
export class SavesModule {}
