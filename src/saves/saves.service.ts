import { Model } from 'mongoose';
import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Save, SaveDocument } from './schemas/save.schema';
import { CreateSaveRequestDto } from './dto/save.dto';
import got from 'got';
import { JSDOM } from 'jsdom';
import { Common, AppError } from 'src/library';
import { v4 as uuidv4 } from 'uuid';
import { parseDomain, ParseResultType } from 'parse-domain';
import { UserStorage } from 'src/auth/strategies/user.storage';
@Injectable()
export class SavesService {
  constructor(@InjectModel(Save.name) private saveModel: Model<SaveDocument>) {}

  async findAll(): Promise<{ total_records: number; data: SaveDocument[] }> {
    const userCtx = UserStorage.get();
    console.log(
      '🚀 ~ file: saves.service.ts:18 ~ SavesService ~ findAll ~ userCtx:',
      userCtx,
    );

    // find total number of docs in db
    const { data: docsCount, error: docsCountErr } = await Common.pWrap(
      this.saveModel.countDocuments({ userUuid: userCtx.uuid }),
    );

    if (docsCountErr) {
      console.log(
        `[SavesSvc][findAll] Failed to countDocuments: ${docsCountErr.message}`,
      );
      throw docsCountErr;
    }

    // get all docs
    // TODO @shawbin: add into server side pagination
    const { data: saves, error: findSavesErr } = await Common.pWrap(
      this.saveModel.find({ userUuid: userCtx.uuid }).lean().exec(),
    );

    if (findSavesErr) {
      console.log(
        `[SavesSvc][findAll] Failed to find all: ${findSavesErr.message}`,
      );
      throw findSavesErr;
    }

    const result = {
      total_records: docsCount,
      data: saves,
    };

    return result;
  }

  async findOne(id: string): Promise<SaveDocument> {
    const userCtx = UserStorage.get();

    const { data, error } = await Common.pWrap(
      this.saveModel
        .findOne({ userUuid: userCtx.uuid, uuid: id })
        .lean()
        .exec(),
    );

    if (error) {
      console.log(`[SavesSvc][findOne] Failed to findOne: ${error.message}`);
      throw error;
    }

    // if no object found
    if (!data) {
      throw AppError.objectNotFoundErr;
    }

    return data;
  }

  async DeleteOne(id: string): Promise<SaveDocument> {
    const userCtx = UserStorage.get();

    const { data, error } = await Common.pWrap(
      this.saveModel
        .findOneAndDelete({ userUuid: userCtx.uuid, uuid: id })
        .lean()
        .exec(),
    );

    if (error) {
      console.log(
        `[SavesSvc][DeleteOne] Failed to findOneAndDelete: ${error.message}`,
      );
      throw error;
    }

    // if no object found
    if (!data) {
      throw AppError.objectNotFoundErr;
    }

    return data;
  }

  async create(createSaveDto: CreateSaveRequestDto): Promise<SaveDocument> {
    const userCtx = UserStorage.get();

    const { data: title, error: getTitleErr } = await Common.pWrap(
      this.getTitleFromLink(createSaveDto.link),
    );

    if (getTitleErr) {
      throw getTitleErr;
    }

    // construct entity
    const newSaveEntity = new this.saveModel(createSaveDto);
    newSaveEntity.userUuid = userCtx.uuid;
    newSaveEntity.uuid = uuidv4();
    newSaveEntity.title = title;

    const { error: saveErr } = await Common.pWrap(newSaveEntity.save());

    if (saveErr) {
      throw saveErr;
    }

    return newSaveEntity.toObject();
  }

  async getTitleFromLink(link: string): Promise<string> {
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
