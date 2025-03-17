import { IsEnum, IsOptional, IsString } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  page?: number = 1;

  @IsOptional()
  size?: number = 20;

  @IsOptional()
  sortBy?: string;

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortDirection?: 'asc' | 'desc';

  @IsOptional()
  @IsString()
  searchQuery?: string;
}
