import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, UpdateQuery } from 'mongoose';
import { Campaign, CampaignDocument } from './schema/campaign.schema';
import { RepositoryService } from '../repository/repository.service';
import {
  CreateCampaignDto,
  GetAllCampaignsDto,
  SearchCampaignDto,
} from './dto/campaign.dto';
import { CategoryService } from '../category/category.service';
import { UserDocument } from '../user/schemas/user.schema';

@Injectable()
export class CampaignService {
  constructor(
    @InjectModel(Campaign.name) private campaignModel: Model<CampaignDocument>,
    private repositoryService: RepositoryService,
    private categoryService: CategoryService,
  ) {}

  async create(user: UserDocument, payload: CreateCampaignDto) {
    await Promise.all([
      this.categoryService.checkCategoryExists(payload.category),
      this.campaignWithNameExist(payload.title),
    ]);

    return await this.campaignModel.create({
      ...payload,
      walletAddress: user.walletAddress,
    });
  }

  async allCampaign(query: GetAllCampaignsDto) {
    return this.repositoryService.paginate({
      model: this.campaignModel,
      query,
      options: {
        ...(query.category && { category: query.category }),
        ...(query.paymentMethod && { paymentMethod: query.paymentMethod }),
      },
      populateFields: 'category',
    });
  }

  async allCampaigns(query: GetAllCampaignsDto) {
    const options: any = {};

    // Only add category filter if it's a valid ObjectId
    if (query.category) {
      if (Types.ObjectId.isValid(query.category)) {
        options.category = query.category;
      } else {
        // If it's not a valid ObjectId, don't include it in the filter
        // This prevents the CastError
        console.log(`Invalid ObjectId format for category: ${query.category}`);
      }
    }

    // Add payment method filter if provided
    if (query.paymentMethod) {
      options.paymentMethod = query.paymentMethod;
    }

    return this.repositoryService.paginate({
      model: this.campaignModel,
      query,
      options,
    });
  }

  async singleCampaign(campaignId: string) {
    const campaign = await this.campaignModel
      .findById(campaignId)
      .populate('category');

    return campaign;
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
