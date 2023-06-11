import { Injectable } from '@nestjs/common';
import { Save } from './interfaces/save.interface';

@Injectable()
export class SavesService {
  private readonly saves: Save[] = [];
  get(): Save[] {
    // return this.saves;
    return [{ title: 'mock_title', img: 'http://blabla', timeMin: 5 }];
  }
}
