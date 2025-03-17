import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRoleEnum } from '../../../../common/enums/user.enum';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: false, default: null, index: true })
  fullname: string;

  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop({ select: false })
  password: string;

  @Prop({ default: '' })
  wallet: string;

  @Prop({ enum: UserRoleEnum, default: UserRoleEnum.USER })
  role: UserRoleEnum;

  @Prop({ default: false })
  isGoogleAuth: boolean;

  @Prop({ default: false })
  isDeleted: boolean;
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
