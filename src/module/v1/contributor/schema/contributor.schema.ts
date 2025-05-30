import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import {
  Campaign,
  CampaignDocument,
} from '../../campaign/schema/campaign.schema';

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

  @Prop()
  wallet: string;

  @Prop({ default: '' })
  transactionHash: string;
}

export const ContributorSchema = SchemaFactory.createForClass(Contributor);

ContributorSchema.pre(/^findOne/, function (next) {
  const preConditions = {
    isDeleted: false,
  };

  const postConditions = this['_conditions'];

  this['_conditions'] = { ...preConditions, ...postConditions };

  next();
});
