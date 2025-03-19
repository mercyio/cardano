import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';

export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => {
    return value.charAt(0).toUpperCase() + value.slice(1).trim();
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @IsMongoId()
  @IsNotEmpty()
  _id: string;
}
