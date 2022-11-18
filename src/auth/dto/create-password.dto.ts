import { IsString, Matches } from 'class-validator';
import {
  PASSWORD_REGEX,
  PASSWORD_EXPLAIN,
} from '../../user/entities/user.entity';

export class CreatePasswordDto {
  @IsString()
  @Matches(PASSWORD_REGEX, { message: PASSWORD_EXPLAIN })
  password: string;
}
