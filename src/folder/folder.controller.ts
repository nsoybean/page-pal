import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FolderService } from './folder.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder-dto';
import { FolderStateEnum } from './interfaces/folder.interface';

@Controller('folder')
@UseGuards(AuthGuard('jwt'))
export class FolderController {
  constructor(private readonly folderService: FolderService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post('')
  async createV3(@Body() createFolderDto: CreateFolderDto) {
    // map to null if 'root' is passed
    if (createFolderDto.parentFolderId === 'root') {
      createFolderDto.parentFolderId = null;
    }

    const newFolder = await this.folderService.create({
      parentFolderId: createFolderDto.parentFolderId,
      name: createFolderDto.folderName,
    });
    return { id: newFolder._id.toString() };
  }

  @Patch(':id/metadata')
  async update(
    @Param('id') id: string,
    @Body() updateFolderDto: UpdateFolderDto,
  ) {
    const updatedFolder = await this.folderService.update({
      id,
      name: updateFolderDto.name.trim(),
    });
    return { id: updatedFolder._id.toString() };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const deletedFolder = await this.folderService.delete({
      id,
    });
    return { id: deletedFolder._id.toString() };
  }

  @Get('/folders')
  async get(@Query('id') id: string) {
    let currFolderId = id;
    if (id === 'root') {
      currFolderId = null;
    }

    const childFolders = await this.folderService.getSubFolderInFolderId({
      folderId: currFolderId,
      state: FolderStateEnum.AVAILABLE,
    });

    if (!currFolderId) {
      return {
        folders: {
          total_records: childFolders.length,
          data: childFolders,
        },
      };
    } else {
      const parentFolders = await this.folderService.getParentFolderOfFolderId({
        folderId: currFolderId,
      });

      return {
        folders: {
          total_records: childFolders.length,
          data: childFolders,
        },
        parentFolderHierarchy: parentFolders || null,
      };
    }
  }
}
