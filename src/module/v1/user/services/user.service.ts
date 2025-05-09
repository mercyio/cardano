import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { User, UserDocument } from '../schemas/user.schema';
import { ClientSession, FilterQuery, Model, UpdateQuery } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BaseHelper } from '../../../../common/utils/helper/helper.util';
import { UserRoleEnum } from '../../../../common/enums/user.enum';
import { CreateUserDto } from '../dto/user.dto';
import { GoogleAuthDto, WalletLoginDto } from '../../auth/dto/auth.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async createUser(
    payload: CreateUserDto,
    role?: UserRoleEnum,
  ): Promise<UserDocument> {
    try {
      const { password, confirmPassword, authSource, email } = payload;
      let userWithEmailExists = false;

      if (email) {
        const existingUser = await this.userModel.exists({ email });
        userWithEmailExists = !!existingUser;

        if (userWithEmailExists) {
          throw new BadRequestException('User with this email already exists');
        }
      }

      if (authSource !== 'WALLET') {
        if (!password) {
          throw new BadRequestException('Password is required');
        }

        if (password !== confirmPassword) {
          throw new BadRequestException(
            'Password and confirm password do not match',
          );
        }
      }

      const hashedPassword =
        authSource !== 'WALLET' && password
          ? await BaseHelper.hashData(password)
          : undefined;

      const userRole = role ?? UserRoleEnum.USER;

      const wallet = BaseHelper.generateWallet();

      const userPayload: any = {
        ...payload,
        password: hashedPassword,
        role: userRole,
        authSource: 'EMAIL',
        isNewUser: !userWithEmailExists,
        walletAddress: wallet.publicKey,
      };

      if (!hashedPassword) delete userPayload.password;
      if (!email) delete userPayload.email;

      const createdUser = await this.userModel.create(userPayload);

      if (createdUser['_doc'].password) {
        delete createdUser['_doc'].password;
      }

      return createdUser;
    } catch (e) {
      console.error('Error while creating user', e);
      if (e.code === 11000) {
        throw new ConflictException(
          `${Object.keys(e.keyValue)} already exists`,
        );
      } else {
        throw new InternalServerErrorException(
          e.response?.message || 'Something went wrong',
        );
      }
    }
  }

  async createUserFromGoogle(payload: GoogleAuthDto) {
    return await this.userModel.create({
      ...payload,
      emailVerified: true,
      isLoggedOut: false,
      authSource: 'GOOGLE',
    });
  }

  async updateUserByEmail(email: string, details: any) {
    return this.userModel.updateOne({ email }, details);
  }

  async getUserDetailsWithPassword(
    query: FilterQuery<UserDocument>,
  ): Promise<UserDocument> {
    return this.userModel.findOne(query).select('+password');
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
