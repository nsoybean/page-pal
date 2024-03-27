import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app/app.controller';
import { AppService } from './app/app.service';
import { AuthModule } from './auth/auth.module';
import { BookmarkModule } from './bookmark/bookmark.module';
import { UserModule } from './user/user.module';
import { HocuspocusModule } from './hocuspocus/hocuspocus.module';
import { TagModule } from './tag/tag.module';
import 'dotenv/config';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI, { dbName: 'page-pal' }),
    AuthModule, // handling authn and authz
    BookmarkModule, // bookmarks
    UserModule, TagModule, // user management
    // HocuspocusModule, // collab editing BE for tiptap
  ],
  controllers: [AppController], // handles HTTP requests
  providers: [AppService], // perform complex tasks
})
export class AppModule {}
