import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Save } from './schemas/save.schema';
import { CreateSaveRequestDto } from './dto/save.dto';
import got from 'got';
import { JSDOM } from 'jsdom';
import { Common, AppError } from 'src/library';
import { Save as ISaveInterface } from './interfaces/save.interface';
import { v4 as uuidv4 } from 'uuid';
import { parseDomain, ParseResultType } from 'parse-domain';

@Injectable()
export class SavesService {
  constructor(@InjectModel(Save.name) private saveModel: Model<Save>) {}

  async findAll(): Promise<Save[]> {
    return await this.saveModel.find().exec();
  }

  async create(createSaveDto: CreateSaveRequestDto): Promise<Save> {
    const { data: title, error: getTitleErr } = await Common.pWrap(
      this.getTitleFromLink(createSaveDto.link),
    );

    if (getTitleErr) {
      throw getTitleErr;
    }

    // construct entity
    const newSaveEntity = new this.saveModel(createSaveDto);
    newSaveEntity.uuid = uuidv4();
    newSaveEntity.title = title;

    const { data: saveRes, error: saveErr } = await Common.pWrap(
      newSaveEntity.save(),
    );

    if (saveErr) {
      throw saveErr;
    }

    return saveRes;
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
