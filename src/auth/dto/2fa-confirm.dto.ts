import { IsNumberString } from 'class-validator';

export class ConfirmTwoFactorsDto {
  @IsNumberString()
  token: string;
}
