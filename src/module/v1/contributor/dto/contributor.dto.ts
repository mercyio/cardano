import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateContributorDto {
  @IsMongoId()
  @IsString()
  @IsNotEmpty()
  campaign: string;

  @IsString()
  @IsNotEmpty()
  amount: string;

  @IsString()
  @IsNotEmpty()
  transactionHash: string;
}
