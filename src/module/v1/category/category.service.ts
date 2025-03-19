import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CategoryDocument, Category } from './schemas/category.schema';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { BaseRepositoryService } from '../repository/base.service';

@Injectable()
export class CategoryService extends BaseRepositoryService<CategoryDocument> {
  constructor(
    @InjectModel(Category.name)
    private categoryModel: Model<CategoryDocument>,
  ) {
    super(categoryModel);
  }

  async create(payload: CreateCategoryDto): Promise<CategoryDocument> {
    const { name } = payload;

    await this.checkCategoryWithNameExists(name);

    return await this.categoryModel.create({
      ...payload,
    });
  }

  async update(payload: UpdateCategoryDto) {
    const { _id, ...updatePayload } = payload;

    const [category] = await Promise.all([
      this.categoryModel.findById(_id),
      updatePayload.name
        ? this.checkCategoryWithNameExists(updatePayload.name, _id)
        : {},
    ]);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return await this.categoryModel.findByIdAndUpdate(
      _id,
      { ...payload },
      { new: true },
    );
  }

  async getAll(): Promise<CategoryDocument[]> {
    return this.categoryModel.find();
  }

  async getById(id: string): Promise<CategoryDocument> {
    return this.categoryModel.findById(id);
  }

  async checkCategoryWithNameExists(name: string, _id?: string) {
    const category = await this.categoryModel.countDocuments({
      name,
      ...(_id && { _id: { $ne: _id } }),
    });

    if (category) {
      throw new BadRequestException(
        `Category with name "${name}" already exists`,
      );
    }
  }

  async checkCategoryExists(_id: string) {
    const category = await this.categoryModel.exists({ _id });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }
}
