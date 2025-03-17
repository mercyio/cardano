import { Controller } from '@nestjs/common';
import { RepositoryService } from './repository.service';
import { NoCache } from '../../../common/decorators/cache.decorator';

@NoCache()
@Controller('repository')
export class RepositoryController {
  constructor(private readonly repositoryService: RepositoryService) {}
}
