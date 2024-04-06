import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClsModule } from 'nestjs-cls';

// tag
import { TagController } from './tag.controller';
import { Tag, TagSchema } from './schemas/tag.schema';
import { TagService } from './tag.service';
import { Bookmark, BookmarkSchema } from 'src/bookmark/schemas/bookmark.schema';
import { UserModule } from 'src/user/user.module';

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
    UserModule,
    MongooseModule.forFeature([
      { name: Tag.name, schema: TagSchema },
      { name: Bookmark.name, schema: BookmarkSchema },
    ]),
  ],
  controllers: [TagController],
  providers: [TagService],
  exports: [TagService],
})
export class TagModule {}
