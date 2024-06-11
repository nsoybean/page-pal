import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClsModule } from 'nestjs-cls';

import { BookmarkController } from './bookmark.controller';
import { Bookmark, BookmarkSchema } from './schemas/bookmark.schema';
import { BookmarkService } from './bookmark.service';
import { TagModule } from 'src/tag/tag.module';
import { FolderModule } from 'src/folder/folder.module';

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
    TagModule,
    forwardRef(() => FolderModule),
    MongooseModule.forFeature([
      { name: Bookmark.name, schema: BookmarkSchema },
    ]),
  ],
  controllers: [BookmarkController],
  providers: [BookmarkService],
  exports: [BookmarkService],
})
export class BookmarkModule {}
