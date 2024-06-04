import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClsModule } from 'nestjs-cls';

import { FolderController } from './folder.controller';
import { Folder, FolderSchema } from './schemas/folder.schema';
import { FolderService } from './folder.service';
import { BookmarkModule } from 'src/bookmark/bookmark.module';

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
    BookmarkModule,
    MongooseModule.forFeature([{ name: Folder.name, schema: FolderSchema }]),
  ],
  controllers: [FolderController],
  providers: [FolderService],
  exports: [FolderService],
})
export class FolderModule {}