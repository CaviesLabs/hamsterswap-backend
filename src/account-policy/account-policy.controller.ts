import { Body, Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  CommonApiResponse,
  CommonResponse,
} from '../api-docs/api-response.decorator';
import { CommonQueryDto } from '../api-docs/dto/common-query.dto';

/**
 * @dev import deps
 */
import { PolicyLockService } from './services/policy-lock.service';
import { GetLockStatusDto } from './dto/email-status.dto';

@Controller('account-policy')
@ApiTags('account-policy')
export class AccountPolicyController {
  constructor(private readonly accountPolicyService: PolicyLockService) {}

  /**
   * @dev Retrieve information of the email and related data.
   * @param body the email status request
   * @returns status of the email
   */
  @CommonApiResponse(CommonResponse.WRONG_FIELD_FORMATS)
  @Get('lock/status')
  async getStatus(
    @Body() body: GetLockStatusDto,
    @Query() { limit, offset }: CommonQueryDto,
  ) {
    return this.accountPolicyService.getStatus(
      body.target,
      body.type,
      limit,
      offset,
    );
  }
}
