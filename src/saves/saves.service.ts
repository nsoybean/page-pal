import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Save, SaveDocument } from './schemas/save.schema';
import { CreateSaveRequestDto, CreateSaveResponseDto } from './dto/save.dto';
import got from 'got';
import { JSDOM } from 'jsdom';
import { Common, AppError } from 'src/library';
import { Save as SaveInterface } from './interfaces/save.interface';
import { v4 as uuidv4 } from 'uuid';
import { parseDomain, ParseResultType } from 'parse-domain';

@Injectable()
export class SavesService {
  constructor(@InjectModel(Save.name) private saveModel: Model<SaveDocument>) {}

  async findAll(): Promise<Save[]> {
    const allSaves = await this.saveModel.find().exec();
    return allSaves;
  }

  async create(
    createSaveDto: CreateSaveRequestDto,
  ): Promise<SaveInterface | Error> {
    const { data: title, error: getTitleErr } = await Common.pWrap(
      this.getTitleFromLink(createSaveDto.link),
    );

    if (getTitleErr) {
      throw getTitleErr;
    }

    // construct entity
    const saveEntity: SaveInterface = {
      uuid: uuidv4(),
      title: title,
      link: createSaveDto.link,
    };

    // persist
    const { error: persistErr } = await Common.pWrap(
      this.saveModel.create(saveEntity),
    );

    if (persistErr) {
      console.log(
        `[SavesSvc][create] Failed to persist doc: ${persistErr.message}`,
      );
      throw AppError.internalServerErr;
    }

    return saveEntity;
  }

  async getTitleFromLink(link: string): Promise<string | Error> {
    const { data, error } = await Common.pWrap(got(link));

    if (error) {
      console.log(
        `[SavesSvc][getTitleFromLink] Failed GET request to link: ${link}, error: ${error.message}`,
      );
      throw AppError.invalidLinkErr;
    }

    const dom = new JSDOM(data.body);

    // first attempt: get title from link
    let title: string = dom.window.document.querySelector('title').textContent;

    // second attempt: get title from url domain
    if (title === '') {
      const parseResult = parseDomain(link);
      // Check if the domain is listed in the public suffix list
      if (parseResult.type === ParseResultType.Listed) {
        const { subDomains, domain, topLevelDomains } = parseResult;
        console.log(
          `[SavesSvc][getTitleFromLink] Parsed domain for link: ${link}, subDomain: ${subDomains}, domain: ${domain}, topLevelDomain: ${topLevelDomains}`,
        );
        title = domain || 'Article';
      }
    }

    return title;
  }
}
