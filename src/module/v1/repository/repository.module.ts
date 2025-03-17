import { Global, Module } from '@nestjs/common';
import { RepositoryService } from './repository.service';
import { RepositoryController } from './repository.controller';

@Global()
@Module({
  controllers: [RepositoryController],
  providers: [RepositoryService],
  exports: [RepositoryService],
})
export class RepositoryModule {}
