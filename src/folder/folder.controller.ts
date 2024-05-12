import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { FolderService } from './folder.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('saves')
@UseGuards(AuthGuard('jwt'))
export class FolderController {
  constructor(private readonly folderService: FolderService) {}

  @Post('/folder/:id')
  async getDataInsideFolder(
    @Param('id') folderId?: string,
    @Query('page') page?: string, // optional
    @Query('limit') limit?: string, // optional
  ) {
    const listData = await this.folderService.getDataInsideFolder({
      folderId,
      page,
      limit,
    });
    return listData;
  }

  @Get()
  async getDataHome(
    @Query('page') page?: string, // optional
    @Query('limit') limit?: string, // optional
  ) {
    const listData = await this.folderService.getDataInsideFolder({
      folderId: null,
      page,
      limit,
    });
    return listData;
  }
}
