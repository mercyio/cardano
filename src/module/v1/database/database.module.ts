import { Module } from '@nestjs/common';
import { ENVIRONMENT } from '../../../common/configs/environment';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forRoot(ENVIRONMENT.DB.URL)],
})
export class DatabaseModule {}
