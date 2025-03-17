import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { PaymentTypeEnum } from 'src/common/enums/payment.enum';
import {
  Campaign,
  CampaignDocument,
} from '../../campaign/schema/campaign.schema';
import { PaymentStatusEnum } from 'src/common/enums/transaction.enum';

export type ContributorDocument = Contributor & Document;

@Schema({ timestamps: true })
export class Contributor {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: () => Campaign,
  })
  campaign: CampaignDocument;

  @Prop({ default: 'anonymous' })
  name: string;

  @Prop()
  amount: string;

  @Prop({ default: '' })
  wallet: string;

  @Prop({ enum: PaymentTypeEnum, required: true })
  paymentMethod: PaymentTypeEnum;

  @Prop({ enum: PaymentStatusEnum, default: PaymentStatusEnum.Pending })
  paymentStatus: PaymentStatusEnum;
}

export const ContributorSchema = SchemaFactory.createForClass(Contributor);
