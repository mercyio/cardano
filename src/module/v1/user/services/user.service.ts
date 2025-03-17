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
import { GoogleAuthDto } from '../../auth/dto/auth.dto';

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
      const userWithEmailExists = await this.userModel.exists({
        email: payload.email,
      });

      if (userWithEmailExists) {
        throw new BadRequestException('User with this email already exists');
      }

      const hashedPassword = await BaseHelper.hashData(payload.password);

      const userRole = role ?? UserRoleEnum.USER;

      const createdUser = await this.userModel.create({
        ...payload,
        password: hashedPassword,
        role: userRole,
      });

      delete createdUser['_doc'].password;
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
      isGoogleAuth: true,
      isLoggedOut: false,
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
