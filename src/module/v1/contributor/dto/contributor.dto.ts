import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { PaymentTypeEnum } from 'src/common/enums/payment.enum';

export class CreateContributorDto {
  @IsMongoId()
  @IsString()
  @IsNotEmpty()
  campaign: string;

  @IsString()
  @IsOptional()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsEnum(PaymentTypeEnum, {
    message: `paymentMethod must be one of: ${Object.values(
      PaymentTypeEnum,
    ).join(', ')}`,
  })
  paymentMethod: PaymentTypeEnum;
}
