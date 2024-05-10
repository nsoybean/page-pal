import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { FolderService } from './folder.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('saves')
@UseGuards(AuthGuard('jwt'))
export class FolderController {
  constructor(private readonly folderService: FolderService) {}

  @Get('/home')
  async getDataInsideFolder(
    // @Param('id') folderId?: string,
    @Query('page') page?: string, // optional
    @Query('limit') limit?: string, // optional
  ) {
    const listData = await this.folderService.getDataInsideFolder({
      id: null,
      page,
      limit,
    });
    return listData;
  }
}
