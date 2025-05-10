import { IsOptional, IsString } from 'class-validator';
import { UserRoleEnum } from 'src/common/enums/user.enum';

export class CreateUserDto {
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  walletAddress?: string;

  @IsString()
  @IsOptional()
  authSource?: string;

  @IsOptional()
  @IsString()
  role?: UserRoleEnum;
}
