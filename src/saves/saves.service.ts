import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Save, SaveDocument } from './schemas/save.schema';

@Injectable()
export class SavesService {
  constructor(@InjectModel(Save.name) private saveModel: Model<SaveDocument>) {}

  async findAll(): Promise<Save[]> {
    const allSaves = await this.saveModel.find().exec();
    return allSaves;
  }
}
