/**
 * @dev Import UserAttributes.
 */
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { Role, UserGroup } from '../entities/user.entity';

/**
 * @dev Declare create user dto
 */
export class CreateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  emailVerified?: boolean;

  @IsString()
  birthday?: Date;

  @IsString()
  displayName?: string;

  @IsString()
  avatar?: string;

  @IsEnum(Role, { each: true })
  roles: Role[];

  @IsEnum(UserGroup, { each: true })
  groups?: UserGroup[];
}
