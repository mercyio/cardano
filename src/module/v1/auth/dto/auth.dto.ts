import { IsEmail, IsOptional, IsString } from 'class-validator';
import { UserRoleEnum } from 'src/common/enums/user.enum';

export class LoginDto {
  @IsOptional()
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class GoogleAuthDto {
  @IsEmail()
  email: string;
}

export class WalletLoginDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  walletAddress?: string;

  @IsString()
  signature: string;

  @IsString()
  nonce: string;

  @IsString()
  @IsOptional()
  authSource?: string;

  @IsOptional()
  @IsString()
  role?: UserRoleEnum;
}

export class WalletNonceDto {
  @IsString()
  walletAddress: string;
}

export interface IWalletNonceResponse {
  nonce: string;
  message: string;
}
