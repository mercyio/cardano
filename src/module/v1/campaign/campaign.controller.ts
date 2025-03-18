import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ResponseMessage } from '../../../common/decorators/response.decorator';
import { RESPONSE_CONSTANT } from '../../../common/constants/response.constant';
import { PaginationDto } from '../repository/dto/repository.dto';
import { CampaignService } from './campaign.service';
import { CreateCampaignDto, SearchCampaignDto } from './dto/campaign.dto';
import { IDQueryDto } from 'src/common/dto/query.dto';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('campaign')
export class CampaignController {
  constructor(private campaignService: CampaignService) {}

  @ResponseMessage(RESPONSE_CONSTANT.CAMPAIGN.CAMPAIGN_CREATE_SUCCESS)
  @Post()
  async create(@Body() payload: CreateCampaignDto) {
    return await this.campaignService.create(payload);
  }

  @Public()
  @Get()
  async singleCampaign(@Query() { _id }: IDQueryDto) {
    return await this.campaignService.singleCampaign(_id);
  }

  @Public()
  @Get('all')
  async allCampaigns(@Query() query: PaginationDto) {
    return await this.campaignService.allCampaigns(query);
  }

  @Public()
  @Get('search')
  async searchCampaigns(@Query() query: SearchCampaignDto) {
    return await this.campaignService.searchCampaigns(query);
  }
}
