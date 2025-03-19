import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateQuery } from 'mongoose';
import { Campaign, CampaignDocument } from './schema/campaign.schema';
import { RepositoryService } from '../repository/repository.service';
import { CreateCampaignDto, SearchCampaignDto } from './dto/campaign.dto';
import { PaginationDto } from '../repository/dto/repository.dto';
import { CategoryService } from '../category/category.service';

@Injectable()
export class CampaignService {
  constructor(
    @InjectModel(Campaign.name) private campaignModel: Model<CampaignDocument>,
    private repositoryService: RepositoryService,
    private categoryService: CategoryService,
  ) {}

  async create(payload: CreateCampaignDto) {
    await Promise.all([
      this.categoryService.checkCategoryExists(payload.category),
      this.campaignWithNameExist(payload.title),
    ]);

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

  async update(
    campaignId: string,
    payload: UpdateQuery<CampaignDocument>,
  ): Promise<CampaignDocument> {
    return await this.campaignModel.findOneAndUpdate(
      { _id: campaignId },
      payload,
      {
        new: true,
      },
    );
  }

  async searchCampaigns(query: SearchCampaignDto) {
    const { searchQuery, page, size } = query;

    return await this.repositoryService.paginate({
      model: this.campaignModel,
      query: { page, size },
      options: {
        $or: [
          {
            title: {
              $regex: new RegExp(searchQuery, 'i'),
            },
          },
          {
            description: {
              $regex: new RegExp(searchQuery, 'i'),
            },
          },
          {
            paymentMethod: {
              $regex: new RegExp(searchQuery, 'i'),
            },
          },
        ],
      },
    });
  }

  async campaignWithNameExist(title: string, _id?: string) {
    const campaign = await this.campaignModel.exists({
      title: new RegExp(title, 'i'),
      _id: { $ne: _id },
    });

    if (campaign) {
      throw new BadRequestException(
        `campaign with name ${title} already exists`,
      );
    }
  }
}
