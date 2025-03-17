import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Campaign, CampaignSchema } from './schema/campaign.schema';
import { CampaignController } from './campaign.controller';
import { CampaignService } from './campaign.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Campaign.name, schema: CampaignSchema },
    ]),
  ],
  controllers: [CampaignController],
  providers: [CampaignService],
  exports: [CampaignService],
})
export class CampaignModule {}
