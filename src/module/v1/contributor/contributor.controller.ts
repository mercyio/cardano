import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Public } from '../../../common/decorators/public.decorator';
import { ResponseMessage } from '../../../common/decorators/response.decorator';
import { RESPONSE_CONSTANT } from '../../../common/constants/response.constant';
import { PaginationDto } from '../repository/dto/repository.dto';
import { ContributorService } from './contributor.service';
import { CreateContributorDto } from './dto/contributor.dto';

@Controller('contribution')
export class ContributorController {
  constructor(private contributorService: ContributorService) {}

  @Public()
  @ResponseMessage(RESPONSE_CONSTANT.CONTRIBUTOR.CONTRIBUTOR_CREATE_SUCCESS)
  @Post()
  async create(@Body() payload: CreateContributorDto) {
    return await this.contributorService.create(payload);
  }

  @Public()
  @Get(':_id/retrieve')
  async retrieveContributorsByCampaignId(
    @Param('_id') _id: string,
    @Query() query: PaginationDto,
  ) {
    return await this.contributorService.retrieveContributorsByCampaignId(
      _id,
      query,
    );
  }

  @Public()
  @Get()
  async allContributors(@Query() query: PaginationDto) {
    return await this.contributorService.allContributors(query);
  }
}
