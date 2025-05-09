import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/user.dto';
import { ResponseMessage } from '../../../common/decorators/response.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { RESPONSE_CONSTANT } from '../../../common/constants/response.constant';
import { NoCache } from '../../../common/decorators/cache.decorator';
import { LoggedInUserDecorator } from '../../../common/decorators/logged-in-user.decorator';
import { UserDocument } from '../user/schemas/user.schema';
import { GoogleAuthDto, LoginDto, WalletLoginDto } from './dto/auth.dto';

@NoCache()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ResponseMessage(RESPONSE_CONSTANT.AUTH.REGISTER_SUCCESS)
  async register(@Body() payload: CreateUserDto) {
    return await this.authService.register(payload);
  }
  @Public()
  @Post('login')
  @ResponseMessage(RESPONSE_CONSTANT.AUTH.LOGIN_SUCCESS)
  async login(@Body() payload: LoginDto) {
    return await this.authService.login(payload);
  }

  @Public()
  @Post('wallet/login')
  @ResponseMessage(RESPONSE_CONSTANT.AUTH.LOGIN_SUCCESS)
  async walletLogin(@Body() payload: WalletLoginDto) {
    return await this.authService.loginWithWallet(payload);
  }

  @Public()
  @Get('wallet/:walletAddress/nonce')
  async getWalletNonce(@Param('walletAddress') walletAddress: string) {
    return await this.authService.generateWalletAuthNonce(walletAddress);
  }

  @Public()
  @Post('google')
  @ResponseMessage(RESPONSE_CONSTANT.AUTH.LOGIN_SUCCESS)
  async googleAuth(@Body() payload: GoogleAuthDto) {
    return await this.authService.googleAuth(payload);
  }

  @Delete('logout')
  async logout(@LoggedInUserDecorator() user: UserDocument) {
    return await this.authService.logout(user._id.toString());
  }
}
