import { IsJWT } from 'class-validator';

/**
 * @dev Introspect dto.
 */
export class IntrospectDto {
  @IsJWT()
  token: string;
}
