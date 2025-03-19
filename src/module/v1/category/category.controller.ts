import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { RESPONSE_CONSTANT } from 'src/common/constants/response.constant';
import { ResponseMessage } from 'src/common/decorators/response.decorator';
import { Public } from '../../../common/decorators/public.decorator';
import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { IDQueryDto } from 'src/common/dto/query.dto';

// TODO: add admin guard
@Controller('category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @ResponseMessage(RESPONSE_CONSTANT.CATEGORY.CREATED_SUCCESS)
  @Post()
  async create(@Body() payload: CreateCategoryDto) {
    return await this.categoryService.create(payload);
  }

  @ResponseMessage(RESPONSE_CONSTANT.CATEGORY.UPDATED_SUCCESS)
  @Patch()
  async update(@Body() payload: UpdateCategoryDto) {
    return await this.categoryService.update(payload);
  }

  @Public()
  @Get()
  async getAll() {
    return await this.categoryService.findAllQuery({
      options: {
        isActive: true,
      },
    });
  }

  @Get('admin/all')
  async adminGetAll() {
    return await this.categoryService.findAllQuery({
      showDeleted: true,
    });
  }

  // @UseGuards(RoleGuard)
  // @Roles(UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN)
  @Delete()
  async delete(@Query() { _id }: IDQueryDto) {
    return await this.categoryService.softDelete(_id);
  }

  // @UseGuards(RoleGuard)
  // @Roles(UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN)
  @Post('restore')
  async restoreDeleted(@Query() { _id }: IDQueryDto) {
    return await this.categoryService.restoreDeleted(_id);
  }
}
