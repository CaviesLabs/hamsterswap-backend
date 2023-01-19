import { Column, Entity } from 'typeorm';
import { TokenMetadataEntity } from '../../swap/entities/token-metadata.entity';
import { BaseModel } from '../base.model';

@Entity({
  name: 'token_metadata',
})
export class TokenMetadataModel
  extends BaseModel
  implements TokenMetadataEntity
{
  @Column({ type: String, unique: true })
  mintAddress: string;

  @Column({ type: 'json', nullable: true })
  metadata: object;

  @Column({ type: Boolean })
  isNft: boolean;
}
