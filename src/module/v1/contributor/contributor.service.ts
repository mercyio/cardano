import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RepositoryService } from '../repository/repository.service';
import { PaginationDto } from '../repository/dto/repository.dto';
import { Contributor, ContributorDocument } from './schema/contributor.schema';
import { CreateContributorDto } from './dto/contributor.dto';
import { CampaignService } from '../campaign/campaign.service';
import { UserDocument } from '../user/schemas/user.schema';

@Injectable()
export class ContributorService {
  constructor(
    @InjectModel(Contributor.name)
    private contributorModel: Model<ContributorDocument>,
    private campaignService: CampaignService,
    private repositoryService: RepositoryService,
  ) {}

  async create(user: UserDocument, payload: CreateContributorDto) {
    const campaign = await this.campaignService.singleCampaign(
      payload.campaign,
    );

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    const existingTransaction = await this.contributorModel.findOne({
      transactionHash: payload.transactionHash,
    });

    if (existingTransaction) {
      throw new BadRequestException('Transaction hash already exists');
    }

    const alreadyContributing = await this.contributorModel.findOne({
      wallet: user.walletAddress,
      campaign: payload.campaign,
    });

    if (alreadyContributing) {
      throw new BadRequestException(
        'You have already contributed to this campaign',
      );
    }

    try {
      const contribution = await this.contributorModel.create({
        campaign: payload.campaign,
        wallet: user.walletAddress,
        amount: payload.amount,
        transactionHash: payload.transactionHash,
      });

      // Update campaign current amount
      await this.campaignService.update(payload.campaign, {
        $inc: { currentAmount: payload.amount },
      });

      await contribution.populate('campaign');

      return contribution;
    } catch (error) {
      throw new BadRequestException('Failed to create contribution record');
    }
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
