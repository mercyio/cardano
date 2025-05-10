import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get('app')
  async getAppInfo() {
    return await this.appService.getAppInfo();
  }

  @Public()
  @Get('health')
  async getAppHealth() {
    return await this.appService.getAppHealth();
  }
}
