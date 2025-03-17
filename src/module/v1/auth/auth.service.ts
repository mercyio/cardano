import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateUserDto } from '../user/dto/user.dto';
import { UserService } from '../user/services/user.service';
import { BaseHelper } from '../../../common/utils/helper/helper.util';
import { JwtService } from '@nestjs/jwt';
import { UserRoleEnum } from '../../../common/enums/user.enum';
import { ENVIRONMENT } from 'src/common/configs/environment';
import { GoogleAuthDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(payload: CreateUserDto, role?: UserRoleEnum) {
    const user = await this.userService.createUser(payload, role);
    return user;
  }

  async login(payload: LoginDto) {
    const { email, password } = payload;

    if (!email) {
      throw new BadRequestException('Email is required');
    }

    const user = await this.userService.getUserDetailsWithPassword({ email });

    if (!user) {
      throw new BadRequestException('Invalid Credential');
    }

    const passwordMatch = await BaseHelper.compareHashedData(
      password,
      user.password,
    );

    if (!passwordMatch) {
      throw new BadRequestException('Incorrect Password');
    }

    const token = this.jwtService.sign(
      { _id: user._id },
      {
        secret: ENVIRONMENT.JWT.SECRET,
      },
    );
    delete user['_doc'].password;

    return {
      ...user['_doc'],
      emailVerified: true,
      accessToken: token,
    };
  }

  async googleAuth(payload: GoogleAuthDto) {
    const { email } = payload;

    const user = await this.userService.getUserByEmail(email);

    if (user) {
      if (!user.isGoogleAuth) {
        throw new ConflictException(
          'Looks like you already have an account! Use your existing login details or choose a different email address to sign up with Google',
        );
      }
      await this.userService.updateUserByEmail(email, {
        isLoggedOut: false,
      });

      const token = this.jwtService.sign({ _id: user._id });
      return { ...user['_doc'], accessToken: token };
    }

    const newUser = await this.userService.createUserFromGoogle(payload);

    const token = this.jwtService.sign({ _id: newUser._id });
    return { ...newUser['_doc'], accessToken: token };
  }

  async logout(userId: string): Promise<void> {
    await this.userService.updateQuery({ _id: userId }, { loginToken: null });
  }
}
