/* eslint-disable prettier/prettier */
import { Controller, Get, UseGuards } from '@nestjs/common';
import { RESPONSE_CONSTANT } from 'src/common/constants/response.constant';
import { NoCache } from 'src/common/decorators/cache.decorator';
import { LoggedInUserDecorator } from 'src/common/decorators/logged-in-user.decorator';
import { ResponseMessage } from 'src/common/decorators/response.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { UserDocument } from './schemas/user.schema';
import { UserService } from './services/user.service';

@NoCache()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @ResponseMessage(RESPONSE_CONSTANT.USER.GET_CURRENT_USER_SUCCESS)
  @Get('/')
  async getCurrentUser(@LoggedInUserDecorator() user: UserDocument) {
    return await this.userService.getUserById(user._id.toString());
  }
}
