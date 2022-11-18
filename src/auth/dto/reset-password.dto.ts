import { IsBoolean, IsString, Matches } from 'class-validator';
import {
  PASSWORD_EXPLAIN,
  PASSWORD_REGEX,
} from '../../user/entities/user.entity';

export class ResetPasswordDto {
  @IsString()
  @Matches(PASSWORD_REGEX, { message: PASSWORD_EXPLAIN })
  newPassword: string;

  @IsBoolean()
  logoutAllSessions: boolean;
}
