import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRoleEnum } from 'src/common/enums/user.enum';

export class CreateUserDto {
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email?: string;

  @IsOptional()
  @IsString()
  walletAddress?: string;

  @IsString()
  @MinLength(4)
  @MaxLength(20)
  password?: string;

  @IsString()
  @MinLength(4)
  @MaxLength(20)
  confirmPassword?: string;

  @IsString()
  @IsOptional()
  authSource?: string;

  @IsOptional()
  @IsString()
  role?: UserRoleEnum;
}
