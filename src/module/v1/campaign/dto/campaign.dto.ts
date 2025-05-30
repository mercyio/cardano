import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaginationDto } from '../../repository/dto/repository.dto';
import { PaymentTypeEnum } from 'src/common/enums/payment.enum';

export class CreateCampaignDto {
  @IsMongoId()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  targetAmount: number;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  startDate: string;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  endDate: string;

  @IsEnum(PaymentTypeEnum, {
    message: `paymentMethod must be one of: ${Object.values(
      PaymentTypeEnum,
    ).join(', ')}`,
  })
  paymentMethod: PaymentTypeEnum;
}

export class SearchCampaignDto extends PaginationDto {
  @IsOptional()
  @IsString()
  searchQuery?: string;
}

export class GetAllCampaignsDto extends PaginationDto {
  @IsOptional()
  @IsEnum(PaymentTypeEnum, {
    message: `paymentMethod must be one of: ${Object.values(
      PaymentTypeEnum,
    ).join(', ')}`,
  })
  paymentMethod: PaymentTypeEnum;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
