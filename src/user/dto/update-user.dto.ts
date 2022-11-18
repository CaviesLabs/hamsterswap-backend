import { IsOptional, IsString, Matches } from 'class-validator';
import { USERNAME_EXPLAIN, USERNAME_REGEX } from '../entities/user.entity';
import { CreateUserAttributeDto } from './create-user.dto';

export class UpdateUserDto extends CreateUserAttributeDto {
  @IsOptional()
  @IsString()
  @Matches(USERNAME_REGEX, {
    message: USERNAME_EXPLAIN,
  })
  username?: string;
}

export type UpdateEmailStatus = {
  email_verified?: boolean;
};
