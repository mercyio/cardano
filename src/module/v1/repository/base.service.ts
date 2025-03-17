import { NotFoundException } from '@nestjs/common';
import {
  Model,
  Document,
  UpdateQuery,
  FilterQuery,
  ClientSession,
} from 'mongoose';
import { IFindQuery } from '../../../common/interfaces/repository.interface';

export class BaseRepositoryService<T extends Document> {
  public readonly publicModel: Model<T>;

  constructor(private readonly model: Model<T>) {
    this.publicModel = model;
  }

  async findOneQuery({
    options,
    showDeleted = false,
    session,
  }: IFindQuery<T>): Promise<T | null> {
    return await this.model
      .findOne({
        ...options,
        isDeleted: showDeleted
          ? { $in: [showDeleted, false, undefined] }
          : { $in: [false, undefined] },
      })
      .session(session);
  }

  async findAllQuery({
    options,
    showDeleted = false,
    session,
  }: IFindQuery<T>): Promise<T[]> {
    return await this.model
      .find({
        ...options,
        isDeleted: showDeleted
          ? { $in: [showDeleted, false, undefined] }
          : { $in: [false, undefined] },
      })
      .session(session);
  }

  async updateQuery(
    query: FilterQuery<T>,
    update: UpdateQuery<T>,
    session?: ClientSession,
  ) {
    return await this.model.updateOne(query, update, { session, new: true });
  }

  async softDelete(id: string) {
    await this.model.findByIdAndUpdate(id, { isDeleted: true });
  }

  async restoreDeleted(id: string) {
    const restored = await this.model.findByIdAndUpdate(
      id,
      {
        isDeleted: false,
      },
      { new: true },
    );

    if (!restored) {
      throw new NotFoundException(
        'The resource you want to restore does not exist',
      );
    }

    return restored;
  }
}
