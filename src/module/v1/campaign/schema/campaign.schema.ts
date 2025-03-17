import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { PaymentTypeEnum } from 'src/common/enums/payment.enum';
import { User, UserDocument } from '../../user/schemas/user.schema';

export type CampaignDocument = Campaign & Document;

@Schema({ timestamps: true })
export class Campaign {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
  })
  user: UserDocument;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  targetAmount: number;

  @Prop({ default: 0 })
  currentAmount: number;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ default: '' })
  wallet: string;

  @Prop({ enum: PaymentTypeEnum, required: true })
  paymentMethod: PaymentTypeEnum;

  @Prop({ type: [{ date: Date, message: String }], default: [] })
  updates: { date: Date; message: string }[];
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);
