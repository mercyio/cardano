import { IsMongoId, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateContributorDto {
  @IsMongoId()
  @IsString()
  @IsNotEmpty()
  campaign: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  wallet: string;
}
