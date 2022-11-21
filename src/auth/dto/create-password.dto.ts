import { IsString } from 'class-validator';

export class CreatePasswordDto {
  @IsString()
  password: string;
}
