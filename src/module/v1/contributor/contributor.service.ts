import {
  ConflictException,
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

@Injectable()
export class ContributorService {
  constructor(
    @InjectModel(Contributor.name)
    private contributorModel: Model<ContributorDocument>,
    private campaignService: CampaignService,
    private repositoryService: RepositoryService,
  ) {}

  async create(payload: CreateContributorDto) {
    const alreadyContributing = await this.contributorModel.exists({
      name: payload.name,
    });

    if (alreadyContributing) {
      throw new ConflictException(
        'this name is  an  existing contributor for this campaign',
      );
    }
    return await this.contributorModel.create(payload);
  }

  async retrieveContributorsByCampaignId(_id: string) {
    const campaign = await this.campaignService.singleCampaign(_id);

    if (!campaign) {
      throw new NotFoundException('incorrect campaign ID');
    }
    return await this.contributorModel.find({ campaign: _id });
  }

  async allContributors(query: PaginationDto) {
    return this.repositoryService.paginate({
      model: this.contributorModel,
      query,
      populateFields: 'campaign',
    });
  }
}
