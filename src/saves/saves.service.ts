import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Save, SaveDocument } from './schemas/save.schema';
import { CreateSaveRequestDto, CreateSaveResponseDto } from './dto/save.dto';
import got from 'got';
import { JSDOM } from 'jsdom';
import { Common, AppError } from 'src/library';
@Injectable()
export class SavesService {
  constructor(@InjectModel(Save.name) private saveModel: Model<SaveDocument>) {}

  async findAll(): Promise<Save[]> {
    const allSaves = await this.saveModel.find().exec();
    return allSaves;
  }

  async saveLink(
    createSaveDto: CreateSaveRequestDto,
  ): Promise<CreateSaveResponseDto> {
    const { data, error } = await Common.pWrap(
      this.getTitleFromLink(createSaveDto.link),
    );

    const newSave: CreateSaveResponseDto = { uuid: '1234' };
    // const allSaves = await this.saveModel.find().exec();
    return newSave;
  }

  async getTitleFromLink(link: string) {
    const { data, error } = await Common.pWrap(got(link));

    if (error) {
      console.log(
        `[SavesSvc][getTitleFromLink] Failed GET request to link: ${error.message}`,
      );
      return AppError.invalidLinkErr;
    }

    const dom = new JSDOM(data.body);

    const title: string =
      dom.window.document.querySelector('title').textContent;

    return title;
  }
}
