import { IsMongoId, IsNotEmpty } from 'class-validator';

export class IDQueryDto {
  @IsMongoId()
  @IsNotEmpty()
  _id: string;
}
