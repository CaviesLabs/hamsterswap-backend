import { IsEmail, IsNumberString, MaxLength } from 'class-validator';

export class VerifyEmailOtpDto {
  @IsNumberString()
  @MaxLength(6)
  token: string;

  @IsEmail()
  email: string;
}
