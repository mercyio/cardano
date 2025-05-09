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
import { GoogleAuthDto, LoginDto, WalletLoginDto } from './dto/auth.dto';
import { cacheKeys } from 'src/common/constants/cache.constant';
import { cacheHelper } from 'src/common/utils/cache-helper.util';
import { authConstants } from 'src/common/constants/authConstant';
import { ERROR_CODES } from 'src/common/constants/error-codes.constant';
import { UserDocument } from '../user/schemas/user.schema';

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

    if (user.authSource !== 'EMAIL') {
      throw new BadRequestException('Please login with your wallet.');
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
      authSource: 'EMAIL',
    };
  }

  async googleAuth(payload: GoogleAuthDto) {
    const { email } = payload;

    const user = await this.userService.getUserByEmail(email);

    if (user) {
      if (user.authSource !== 'GOOGLE') {
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

  async generateWalletAuthNonce(
    walletAddress: string,
  ): Promise<{ nonce: string; message: string }> {
    // Check rate limiting
    const rateLimitKey = cacheKeys.walletNonceRateLimit(walletAddress);
    let currentRequests = await cacheHelper.getCache<number>(rateLimitKey);
    const ttl = await cacheHelper.getTtl(rateLimitKey);

    if (currentRequests && ttl <= 0) {
      await cacheHelper.removeFromCache(rateLimitKey);
      currentRequests = 0;
    }

    if (currentRequests && currentRequests >= authConstants.nonceRateLimitMax) {
      throw new BadRequestException(
        `Too many requests. Please try again in ${Math.ceil(ttl)} seconds.`,
        ERROR_CODES.BAD_REQUEST,
      );
    }

    // Generate a nonce
    const nonce = BaseHelper.generateUuid();
    const message = BaseHelper.createSignatureMessage(walletAddress, nonce);

    // Store nonce in Redis with expiration
    const nonceKey = cacheKeys.walletNonce(walletAddress);
    await cacheHelper.setCache(
      nonceKey,
      nonce,
      authConstants.nonceRateLimitWindow,
    );

    // Update rate limiting (preserve existing window)
    const newRateLimit = currentRequests ? currentRequests + 1 : 1;
    const newTtl = !currentRequests ? authConstants.nonceRateLimitWindow : ttl;
    await cacheHelper.setCache(rateLimitKey, newRateLimit, newTtl);

    return {
      nonce,
      message,
    };
  }

  async loginWithWallet(payload: WalletLoginDto) {
    // Verify nonce exists and hasn't expired
    const nonceKey = cacheKeys.walletNonce(payload.walletAddress);
    const storedNonce = await cacheHelper.getCache<string>(nonceKey);

    // TODO: ENABLE NONCE CHECKING
    // if (!storedNonce) {
    //   throw new BadRequestException(
    //     'Invalid or expired nonce. Please request a new one.',
    //     ERROR_CODES.UNAUTHORIZED,
    //   );
    // }

    // if (storedNonce !== payload.nonce) {
    //   throw new BadRequestException('Invalid nonce.', ERROR_CODES.UNAUTHORIZED);
    // }

    // // Recreate the message that was signed
    // const message = BaseHelper.createSignatureMessage(
    //   payload.walletAddress,
    //   payload.nonce,
    // );

    // // Verify signature
    // const isValidSignature = BaseHelper.verifyWalletSignature(
    //   message,
    //   payload.signature,
    //   payload.walletAddress,
    // );

    // if (!isValidSignature) {
    //   throw new BadRequestException(
    //     'Invalid wallet signature.',
    //     ERROR_CODES.UNAUTHORIZED,
    //   );
    // }

    // Remove the used nonce immediately
    await cacheHelper.removeFromCache(nonceKey);

    const existingUser = (await this.userService.findOneQuery({
      walletAddress: payload.walletAddress,
    })) as UserDocument;

    let user = existingUser;

    if (existingUser) {
      await this.userService.updateQuery(
        { _id: existingUser._id },
        {
          $set: {
            username: payload.username,
            authSource: 'WALLET',
          },
        },
      );
    } else {
      user = await this.userService.createUser({
        walletAddress: payload.walletAddress,
        username: payload.username,
        role: payload.role,
      });
    }

    // Generate JWT token
    const token = this.jwtService.sign(
      { _id: user._id, role: user.role },
      {
        secret: ENVIRONMENT.JWT.SECRET,
      },
    );

    return {
      isNewUser: !existingUser,
      token,
      user: {
        _id: user._id,
        walletAddress: user.walletAddress,
        role: user.role,
        profileImage: user.profileImage,
      },
    };
  }
  async logout(userId: string): Promise<void> {
    await this.userService.updateQuery({ _id: userId }, { loginToken: null });
  }
}
