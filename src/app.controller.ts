import { Controller } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // @Get()
  // async getUserInfo() {
  //   return await this.appService.getUserInfo();
  // }
}
