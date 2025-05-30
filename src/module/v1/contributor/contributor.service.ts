import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RepositoryService } from '../repository/repository.service';
import { PaginationDto } from '../repository/dto/repository.dto';
import { Contributor, ContributorDocument } from './schema/contributor.schema';
import { CreateContributorDto } from './dto/contributor.dto';
import { CampaignService } from '../campaign/campaign.service';

@Injectable()
export class ContributorService {
  constructor(
    @InjectModel(Contributor.name)
    private contributorModel: Model<ContributorDocument>,
    private campaignService: CampaignService,
    private repositoryService: RepositoryService,
  ) {}

  async create(payload: CreateContributorDto) {
    const campaign = await this.campaignService.singleCampaign(
      payload.campaign,
    );

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    // const alreadyContributing = await this.contributorModel.findOne({
    //   wallet: payload.wallet,
    //   campaign: payload.campaign,
    // });

    // if (alreadyContributing) {
    //   return alreadyContributing;
    // }

    const contribution = await this.contributorModel.create(payload);
    await this.campaignService.update(payload.campaign, {
      $inc: { currentAmount: payload.amount },
    });

    return contribution;
  }

  async retrieveContributorsByCampaignId(_id: string, query: PaginationDto) {
    const campaign = await this.campaignService.singleCampaign(_id);

    if (!campaign) {
      throw new NotFoundException('incorrect campaign ID');
    }
    return this.repositoryService.paginate({
      model: this.contributorModel,
      query,
      options: { campaign: _id },
      populateFields: 'campaign',
    });
  }

  async retrieveSIngleContributor(_id: string) {
    return await this.contributorModel.findOne({ _id: _id });
  }

  async allContributors(query: PaginationDto) {
    return this.repositoryService.paginate({
      model: this.contributorModel,
      query,
      populateFields: 'campaign',
    });
  }
}
