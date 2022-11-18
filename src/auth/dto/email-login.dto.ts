import { IsEmail, IsString, Matches } from 'class-validator';
import {
  PASSWORD_EXPLAIN,
  PASSWORD_REGEX,
} from '../../user/entities/user.entity';

export class EmailLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @Matches(PASSWORD_REGEX, { message: PASSWORD_EXPLAIN })
  password: string;
}
