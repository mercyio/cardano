import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { ENVIRONMENT } from '../../../../common/configs/environment';
import { UserService } from '../../user/services/user.service';
import { TokenExpiredError } from '@nestjs/jwt';
import { AppError } from '../../../../common/filter/app-error.filter';
import { ERROR_CODES } from '../../../../common/constants/error-codes.constant';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      passReqToCallback: true,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: ENVIRONMENT.JWT.SECRET,
    });
  }

  async validate(req: Request, payload: Partial<{ _id: string }>) {
    let errorMessage = 'Invalid auth token, please login again.';
    let isError = false;

    try {
      const { _id } = payload;

      const user = await this.userService.getUserById(_id);

      if (!user) {
        errorMessage = 'Invalid auth token, please login again.';
        isError = true;
      }

      if (user && !user?.emailVerified) {
        errorMessage = 'Please verify your email to continue.';
        isError = true;
      }

      if (isError) {
        throw new AppError(
          errorMessage,
          HttpStatus.UNAUTHORIZED,
          ERROR_CODES.INVALID_ACCESS_TOKEN,
        );
      }

      return user;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new AppError(
          'Session expired, login again.',
          HttpStatus.UNAUTHORIZED,
          ERROR_CODES.INVALID_ACCESS_TOKEN,
        );
      } else {
        throw new UnauthorizedException('Session expired.');
      }
    }
  }
}
