import { IsEmail, IsOptional, IsString } from 'class-validator';

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
