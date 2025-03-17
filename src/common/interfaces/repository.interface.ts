import { ClientSession, FilterQuery, Model, PipelineStage } from 'mongoose';
import { PaginationDto } from '../../module/v1/repository/dto/repository.dto';

export interface IFindQuery<T> {
  options?: FilterQuery<T>;
  showDeleted?: boolean;
  session?: ClientSession;
}

export interface IPaginationPayload<T> {
  model: Model<T>;
  query?: PaginationDto;
  options?: FilterQuery<T>;
  populateFields?: string | object[];
  selectFields?: string;
  autopopulate?: boolean;
}

export interface IAggregatePaginationQuery<T> {
  model: Model<T>;
  query?: PaginationDto;
  options?: PipelineStage[];
}

export interface IPaginationResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    size: number;
    lastPage: number;
  };
}
