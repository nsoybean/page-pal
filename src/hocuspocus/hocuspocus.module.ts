import { Inject } from '@nestjs/common';
import { BookmarkModule } from '../bookmark/bookmark.module';
import { Module, Logger } from '@nestjs/common';
import { BookmarkService } from 'src/bookmark/bookmark.service';
import { Server, Document } from '@hocuspocus/server';
import { Doc } from 'yjs';
import { Database } from '@hocuspocus/extension-database';

// webserver module, utilizes service for heavy-lifting
@Module({
  imports: [BookmarkModule],
})
export class HocuspocusModule {
  private readonly logger = new Logger(HocuspocusModule.name);
  private port: number;
  private debounce: number;
  private quiet: boolean;
  private server: any;
  private bookmarkService: any;

  constructor(
    @Inject(BookmarkService)
    bookmarkService: BookmarkService,
  ) {
    this.port = 3338;
    this.debounce = 5000;
    this.quiet = true;

    this.server = Server.configure({
      port: this.port,
      debounce: this.debounce,
      quiet: this.quiet,

      /**
       * HOOKS
       */
      // when a connection is established
      // async connected() {
      //   console.log('connections:', Server.getConnectionsCount());
      //   console.log('documents:', Server.getDocumentsCount());
      // },

      // authenticate user by token
      // async onAuthenticate(data) {
      //   const { token, socketId, documentName } = data;
      //   console.log(
      //     `🚀 [onAuthenticate] filtered data,\ntoken:${token},\nsocketId:${socketId},\ndocumentName:${documentName}`,
      //   );

      //   // terminate client's connection
      //   // throw new Error('Unauthenticated');
      //   // set contextual data to use it in other hooks
      //   return {
      //     user: {
      //       id: 1234,
      //       name: 'John',
      //     },
      //   };
      // },

      // async onStoreDocument(data) {
      //   const { document, documentName, context } = data;
      //   console.log(
      //     '🚀 ~ file: hocuspocus.module.ts:62 ~ HocuspocusModule ~ onStoreDocument ~ context:',
      //     context,
      //   );
      //   // console.log('🚀 [onStoreDocument] document :', document);
      //   // Save to database. Example:
      //   // saveToDatabase(data.document, data.documentName);
      //   try {
      //     const doc = await bookmarkService.updateNote(
      //       '5999b7cdc',
      //       document,
      //     );
      //     console.log(
      //       '🚀 ~ file: hocuspocus.module.ts:66 ~ HocuspocusModule ~ onStoreDocument ~ doc:',
      //       doc,
      //     );
      //   } catch (error) {
      //     console.log(
      //       '🚀 ~ file: hocuspocus.module.ts:74 ~ HocuspocusModule ~ onStoreDocument ~ error:',
      //       error,
      //     );
      //   }
      // },

      // async onLoadDocument(data): Promise<Doc> {
      //   // loadFromDatabase(data.documentName) || createInitialDocTemplate()
      //   console.log('🚀 return data');
      //   const doc = await bookmarkService.fetchNote(
      //     '5999b7cdc',
      //   );
      //   return doc;
      // },

      // extensions: [
      //   new Database({
      //     store: async ({ documentName, state }) => {
      //       console.log('🚀 state:', state);
      //       try {
      //         const doc = await bookmarkService.updateNote(
      //           '5999b7cdc',
      //           state,
      //         );
      //         console.log(
      //           '🚀 ~ file: hocuspocus.module.ts:66 ~ HocuspocusModule ~ onStoreDocument ~ doc:',
      //           doc,
      //         );
      //         return true;
      //       } catch (error) {
      //         console.log(
      //           '🚀 ~ file: hocuspocus.module.ts:74 ~ HocuspocusModule ~ onStoreDocument ~ error:',
      //           error,
      //         );
      //         return false;
      //       }
      //     },
      //     fetch: async ({ documentName }) => {
      //       const doc = await bookmarkService.fetchNote(
      //         '5999b7cdc',
      //       );
      //       console.log('🚀 ~ fetch doc:', doc);
      //       return doc;
      //     },
      //   }),
      // ],
    });

    // start server
    this.server
      .listen()
      .then(() => {
        this.logger.log(
          `Websocket enabled for tiptap's collab editor. Listening on port ${this.port}`,
        );
      })
      .catch((error) => {
        this.logger.error(`Websocket failed to initialize. Error: ${error}`);
      });
  }
}
