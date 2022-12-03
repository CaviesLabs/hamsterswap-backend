/**
 * @dev Import UserAttributes.
 */
import { IsDate, IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { Role, UserGroup } from '../entities/user.entity';

/**
 * @dev Declare create user dto
 */
export class CreateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  emailVerified?: boolean;

  @IsDate()
  @IsOptional()
  birthday?: Date;

  @IsEmail()
  @IsOptional()
  displayName?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsEnum(Role, { each: true })
  roles: Role[];

  @IsEnum(UserGroup, { each: true })
  groups?: UserGroup[];

  @IsString()
  @IsOptional()
  telegram?: string;

  @IsString()
  @IsOptional()
  twitter?: string;
}
