import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

/**
 * @dev import deps
 */
import {
  CommonApiResponse,
  CommonResponse,
} from '../../api-docs/api-response.decorator';
import { UtilsProvider } from '../../providers/utils.provider';
import { TokenSetEntity } from '../entities/token-set.entity';
import { IdpMapName } from '../../providers/idp/identity-provider.interface';
import { IdpAuthService } from '../services/idp-auth.service';
import { IdpParamsMapping } from '../../user/dto/idp-resource.dto';
import { IdpSignInPayload, IdpSignUpPayload } from '../dto/idp-auth.dto';

@Controller('auth/idp')
@ApiTags('external')
export class IdpAuthController {
  constructor(private readonly idpAuthService: IdpAuthService) {}

  /**
   * @dev Signin user in with Google OAuth2.0 access token
   */
  @CommonApiResponse(CommonResponse.WRONG_FIELD_FORMATS)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Signed in successfully',
    type: TokenSetEntity,
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('/:provider/sign-in')
  public signIn(
    @Param() params: IdpParamsMapping,
    @Body() payload: IdpSignInPayload,
  ): Promise<TokenSetEntity> {
    /**
     * @dev Refresh token. But need to override error and raise unauthorized error only.
     */
    return new UtilsProvider().overrideErrorWrap<TokenSetEntity>(
      async () =>
        this.idpAuthService.signIn(IdpMapName[params.provider], payload),
      {
        exceptionClass: UnauthorizedException,
      },
    );
  }

  /**
   * @dev Signin user in with Google OAuth2.0 access token
   */
  @CommonApiResponse(CommonResponse.WRONG_FIELD_FORMATS)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Signed in successfully',
    type: TokenSetEntity,
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('/:provider/sign-up')
  public signUp(
    @Param() params: IdpParamsMapping,
    @Body() payload: IdpSignUpPayload,
  ): Promise<TokenSetEntity> {
    /**
     * @dev Refresh token. But need to override error and raise unauthorized error only.
     */
    return new UtilsProvider().overrideErrorWrap<TokenSetEntity>(
      async () =>
        this.idpAuthService.signUp(IdpMapName[params.provider], payload),
      {
        exceptionClass: UnauthorizedException,
      },
    );
  }
}
