import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleSignatureDto {
  @IsString()
  @IsNotEmpty()
  accessToken: string;
}
