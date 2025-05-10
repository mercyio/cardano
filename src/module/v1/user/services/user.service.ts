import { Injectable } from '@nestjs/common';
import { User, UserDocument } from '../schemas/user.schema';
import { ClientSession, FilterQuery, Model, UpdateQuery } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { GoogleAuthDto } from '../../auth/dto/auth.dto';
import { CreateUserDto } from '../dto/user.dto';
import { AuthSourceEnum, UserRoleEnum } from 'src/common/enums/user.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async createWalletUser(payload: CreateUserDto): Promise<UserDocument> {
    const newUser = await this.userModel.create({
      walletAddress: payload.walletAddress,
      username: payload.username,
      role: payload.role || UserRoleEnum.USER,
      authSource: AuthSourceEnum.WALLET,
    });

    return newUser;
  }

  async createUserFromGoogle(payload: GoogleAuthDto) {
    return await this.userModel.create({
      ...payload,
      isLoggedOut: false,
      authSource: AuthSourceEnum.GOOGLE,
    });
  }

  async updateUserByEmail(email: string, details: any) {
    return this.userModel.updateOne({ email }, details);
  }

  async getUserById(
    id: string,
    populateFields?: string,
  ): Promise<UserDocument> {
    return this.userModel.findOne({ _id: id }).populate(populateFields);
  }

  async getUserByEmail(
    email: string,
    populateFields?: string,
  ): Promise<UserDocument> {
    return this.userModel.findOne({ email }).populate(populateFields);
  }

  async updateQuery(
    filter: FilterQuery<UserDocument>,
    payload: UpdateQuery<UserDocument>,
    session?: ClientSession,
  ): Promise<UserDocument> {
    const updatedUser = await this.userModel.findOneAndUpdate(filter, payload, {
      session,
    });

    return updatedUser;
  }

  async deleteUser(id: string) {
    return this.userModel.findByIdAndDelete(id);
  }

  async findOneQuery(query: FilterQuery<UserDocument>) {
    return await this.userModel.findOne(query);
  }
}
