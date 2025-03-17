import { Injectable } from '@nestjs/common';
import {
  IAggregatePaginationQuery,
  IPaginationPayload,
  IPaginationResponse,
} from '../../../common/interfaces/repository.interface';
import { PipelineStage, PopulateOptions } from 'mongoose';

@Injectable()
export class RepositoryService {
  async paginate<T>({
    model,
    query,
    options,
    populateFields,
    selectFields,
    autopopulate = true,
  }: IPaginationPayload<T>): Promise<IPaginationResponse<T>> {
    const {
      page = 1,
      size = 10,
      sortBy = 'createdAt',
      sortDirection = 'desc',
    } = query;

    const skip = (page - 1) * size;
    const sort = sortBy
      ? { [sortBy]: sortDirection === 'desc' ? -1 : 1 }
      : null;

    const [data, total] = await Promise.all([
      model
        .find(
          {
            ...options,
          },
          {},
          { autopopulate },
        )
        .skip(skip)
        .limit(size > 100 ? 100 : size)
        .populate(null)
        .populate(populateFields as PopulateOptions[])
        .select(selectFields)
        .sort(sort as { [key: string]: 1 | -1 })
        .lean(),
      model.countDocuments({
        ...options,
      }),
    ]);

    return {
      data: data as T[],
      meta: {
        total,
        page: Number(page),
        size: Number(size),
        lastPage: Math.ceil(total / size),
      },
    };
  }

  async paginateAggregate<T>({
    model,
    query,
    options,
  }: IAggregatePaginationQuery<T>): Promise<IPaginationResponse<T>> {
    const {
      page = 1,
      size = 10,
      sortBy = 'createdAt',
      sortDirection = 'desc',
    } = query;

    // Convert sort direction to MongoDB format (-1 for desc, 1 for asc)
    const sortValue = sortDirection === 'desc' ? -1 : 1;

    const pipeline = [
      ...options,
      {
        $sort: {
          [sortBy]: sortValue,
        },
      },
      {
        $skip: (page - 1) * size,
      },
      {
        $limit: size > 100 ? 100 : size,
      },
    ];

    const [data, total] = await Promise.all([
      model.aggregate(pipeline as PipelineStage[]),
      model.aggregate([
        ...options,
        {
          $count: 'total',
        },
      ]),
    ]);

    const totalCount = total[0] ? total[0].total : 0;

    return {
      data,
      meta: {
        total: totalCount,
        page: Number(page),
        size: Number(size),
        lastPage: Math.ceil(totalCount / size),
      },
    };
  }
}
