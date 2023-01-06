import { Column, Entity } from 'typeorm';

import { BaseModel } from '../base.model';
import { TokenMetadataEntity } from '../../swap/entities/token-metadata.entity';
import { SupportedChain } from '../../providers/registry.provider';

@Entity({
  name: 'token_metadata',
})
export class TokenMetadataModel
  extends BaseModel
  implements TokenMetadataEntity
{
  @Column({ type: String })
  mintAddress: string;

  @Column({ type: 'json', nullable: true })
  metadata: object;

  @Column({ type: Boolean })
  isNft: boolean;

  @Column({ type: String })
  chain: SupportedChain;
}
