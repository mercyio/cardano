/* eslint-disable prettier/prettier */
import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { NoCache } from '../../../../common/decorators/cache.decorator';
import { RESPONSE_CONSTANT } from '../../../../common/constants/response.constant';
import { ResponseMessage } from '../../../../common/decorators/response.decorator';
import { LoggedInUserDecorator } from '../../../../common/decorators/logged-in-user.decorator';
import { UserDocument } from '../schemas/user.schema';

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
