import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { FolderService } from './folder.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('folders')
@UseGuards(AuthGuard('jwt'))
export class FolderController {
  constructor(private readonly folderService: FolderService) {}

  @Get('/:id')
  async getDataInsideFolder(@Param('id') id: string) {
    // TODO @sb: add validation to query param
    const listData = await this.folderService.getAllDataInsideFolder();

    return true;
  }
}
