import {
  IsEmail,
  IsNumberString,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import {
  PASSWORD_REGEX,
  PASSWORD_EXPLAIN,
} from '../../user/entities/user.entity';

export class EmailSignUpDto {
  @IsEmail()
  email?: string;

  @IsString()
  @Matches(PASSWORD_REGEX, { message: PASSWORD_EXPLAIN })
  password?: string;

  @IsNumberString()
  @MaxLength(6)
  token: string;
}
