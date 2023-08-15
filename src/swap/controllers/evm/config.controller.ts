import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RegistryProvider } from '../../../providers/registry.provider';

@Controller('evm/platform-config')
@ApiTags('evm/swap')
export class EvmSwapConfigController {
  @Get()
  getChainConfig() {
    return new RegistryProvider().getChainConfig();
  }
}
