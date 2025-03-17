import { Module } from '@nestjs/common';
import { AuthModule } from './module/v1/auth/auth.module';
import { UserModule } from './module/v1/user/user.module';
import { RepositoryModule } from './module/v1/repository/repository.module';
import { DatabaseModule } from './module/v1/database/database.module';
import { CampaignModule } from './module/v1/campaign/campaign.module';
import { ContributorModule } from './module/v1/contributor/contributor.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UserModule,
    RepositoryModule,
    CampaignModule,
    ContributorModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
