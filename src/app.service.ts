import { Injectable } from '@nestjs/common';
import { APP_CONSTANT } from './common/constants/app.constant';

@Injectable()
export class AppService {
  async getAppInfo() {
    return {
      appName: APP_CONSTANT.appName,
      appVersion: APP_CONSTANT.appVersion,
      appDescription: APP_CONSTANT.appDescription,
      timeStamp: new Date().toISOString(),
    };
  }

  async getAppHealth() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timeStamp: new Date().toISOString(),
    };
  }
}
