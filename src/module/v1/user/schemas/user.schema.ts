import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRoleEnum } from '../../../../common/enums/user.enum';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: false, default: null, index: true })
  username: string;

  @Prop({ required: false, default: null })
  email: string;

  @Prop({ default: null })
  walletAddress: string;

  @Prop({ required: false, default: null })
  authSource: string;

  @Prop({ required: false, default: null })
  profileImage: string;

  @Prop({ enum: UserRoleEnum, default: UserRoleEnum.USER })
  role: UserRoleEnum;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: false })
  isNewUser: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre(/^find/, function (next) {
  const preConditions = {
    isDeleted: false,
  };

  const postConditions = this['_conditions'];

  this['_conditions'] = { ...preConditions, ...postConditions };

  next();
});
