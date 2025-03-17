import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { PaymentTypeEnum } from 'src/common/enums/payment.enum';

export class CreateCampaignDto {
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
