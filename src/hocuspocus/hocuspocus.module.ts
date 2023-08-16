import { Module, Logger } from '@nestjs/common';

import { Hocuspocus, Server } from '@hocuspocus/server';

import { BookmarkService } from 'src/bookmark/bookmark.service';

// webserver module, utilizes service for heavy-lifting
@Module({})
export class HocuspocusModule {
  private readonly logger = new Logger(HocuspocusModule.name);
  private port: number;
  private debounce: number;
  private quiet: boolean;
  private server: any;
  private readonly bookmarkService: BookmarkService;

  constructor() {
    this.port = 3338;
    this.debounce = 5000;
    this.quiet = true;

    this.server = Server.configure({
      port: this.port,
      debounce: this.debounce,
      quiet: this.quiet,

      // hooks
      async connected() {
        console.log('connections:', Server.getConnectionsCount());
        console.log('documents:', Server.getDocumentsCount());
      },

      //   async onStoreDocument(data) {
      //     console.log('data:', data);
      //   },
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
