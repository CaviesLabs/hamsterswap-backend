import { IsEmail } from 'class-validator';

export class RequestVerifyOtpEmailDto {
  @IsEmail()
  email: string;
}
