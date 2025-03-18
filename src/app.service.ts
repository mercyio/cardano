import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  async getUserInfo() {
    return {
      email: 'mercyvincent_@gmail.com',
      current_datetime: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
      github_url: 'https://github.com/mercyio/cardano',
    };
  }
}
