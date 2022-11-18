import { IsString } from 'class-validator';

/**
 * @dev Define auth challenge dto.
 */
export class AuthChallengeDto {
  @IsString()
  target: string;
}
