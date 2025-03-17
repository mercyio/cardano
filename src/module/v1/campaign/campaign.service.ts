import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Campaign, CampaignDocument } from './schema/campaign.schema';
import { RepositoryService } from '../repository/repository.service';
import { CreateCampaignDto } from './dto/campaign.dto';
import { PaginationDto } from '../repository/dto/repository.dto';

@Injectable()
export class CampaignService {
  constructor(
    @InjectModel(Campaign.name) private campaignModel: Model<CampaignDocument>,
    private repositoryService: RepositoryService,
  ) {}

  async create(payload: CreateCampaignDto) {
    const campaignNameExist = await this.campaignModel.exists({
      title: payload.title,
    });

    if (campaignNameExist) {
      throw new ConflictException('this campaign already exist');
    }

    return await this.campaignModel.create(payload);
  }

  async allCampaigns(query: PaginationDto) {
    return this.repositoryService.paginate({
      model: this.campaignModel,
      query,
    });
  }

  async singleCampaign(campaignId: string) {
    return await this.campaignModel.findById(campaignId);
  }
}
