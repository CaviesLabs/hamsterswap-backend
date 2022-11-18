import { IsString, Matches } from 'class-validator';
import {
  PASSWORD_EXPLAIN,
  PASSWORD_REGEX,
} from '../../user/entities/user.entity';

export class UpdatePasswordDto {
  @IsString()
  @Matches(PASSWORD_REGEX, { message: PASSWORD_EXPLAIN })
  password: string;

  @IsString()
  @Matches(PASSWORD_REGEX, { message: PASSWORD_EXPLAIN })
  newPassword: string;
}
