import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContributorService } from './contributor.service';
import { ContributorController } from './contributor.controller';
import { Contributor, ContributorSchema } from './schema/contributor.schema';
import { CampaignModule } from '../campaign/campaign.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Contributor.name, schema: ContributorSchema },
    ]),
    CampaignModule,
  ],
  controllers: [ContributorController],
  providers: [ContributorService],
  exports: [ContributorService],
})
export class ContributorModule {}
