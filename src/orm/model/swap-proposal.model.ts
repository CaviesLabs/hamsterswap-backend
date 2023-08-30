import { Exclude } from 'class-transformer';
import {
  Column,
  Entity,
  Generated,
  Index,
  JoinTable,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { SwapItemType } from '../../swap/entities/swap-item.entity';

import {
  SwapProposalEntity,
  SwapProposalStatus,
} from '../../swap/entities/swap-proposal.entity';
import { BaseModel } from '../base.model';
import { SwapItemModel } from './swap-item.model';
import { SwapOptionModel } from './swap-option.model';
import { UserModel } from './user.model';
import { ChainId } from '../../swap/entities/swap-platform-config.entity';
import {
  NFTMetadata,
  TokenMetadata,
} from '../../swap/entities/token-metadata.entity';

@Entity({
  name: 'swap_proposal',
})
export class SwapProposalModel extends BaseModel implements SwapProposalEntity {
  @Column({ type: Number, nullable: true })
  @Generated('increment')
  numberId: number;

  @Column({ type: String, enum: ChainId, default: ChainId.Solana })
  chainId: ChainId;

  @Column({ type: String })
  ownerId: string;

  @ManyToOne(() => UserModel)
  owner: UserModel;

  @Column({ type: String })
  ownerAddress: string;

  @OneToMany(() => SwapItemModel, (item) => item.proposal, {
    cascade: true,
    nullable: true,
  })
  @JoinTable()
  offerItems: SwapItemModel[];

  @OneToMany(() => SwapOptionModel, (option) => option.proposal, {
    cascade: true,
  })
  swapOptions: SwapOptionModel[];

  @Column({ type: String, nullable: true })
  fulfillBy?: string;

  @Column({ type: String, nullable: true })
  fulfilledWithOptionId?: string;

  @Column({ type: 'timestamptz' })
  expiredAt: Date;

  @Column({ type: String, enum: SwapProposalStatus })
  status: SwapProposalStatus;

  @Column({ type: String, default: '' })
  note: string;

  @Column({ type: String, default: '' })
  @Index({ fulltext: true })
  @Exclude({ toPlainOnly: true })
  searchText: string;

  /**
   * @dev Only call this when already fetch full proposal
   */
  buildSearchText() {
    const keyWords = [
      this.ownerAddress,
      this.note.trim().replace(/\n|[\s]{2,}/g, ' '),
    ];

    const extractItemKeyWords = ({
      type,
      contractAddress,
      nftMetadata,
    }: SwapItemModel) => {
      keyWords.push(contractAddress);
      if (type === SwapItemType.NFT) {
        // legacy data
        if (nftMetadata['nft_name']) {
          keyWords.push(
            nftMetadata['nft_name'],
            nftMetadata['nft_collection_name'],
          );
          const attributes = nftMetadata?.['nft_attributes']?.['attributes'];
          if (Array.isArray(attributes)) {
            attributes.forEach(({ value }) => keyWords.push(value));
          }

          return;
        }

        // handle new data format
        if (nftMetadata['metadata']) {
          const metadata = nftMetadata['metadata'] as NFTMetadata;

          keyWords.push(
            metadata.id,
            metadata.name,
            metadata.collectionName,
            metadata.address,
          );

          const attributes = metadata?.attributes;
          if (attributes) {
            attributes.forEach(({ value }) => keyWords.push(value.toString()));
          }

          return;
        }
      }

      if (type === SwapItemType.CURRENCY) {
        // handle new data format
        if (nftMetadata['metadata']) {
          const metadata = nftMetadata['metadata'] as TokenMetadata;

          keyWords.push(metadata.symbol, metadata.name, metadata.address);

          return;
        }
      }
    };

    this.offerItems?.forEach((item) => extractItemKeyWords(item));

    this.swapOptions?.forEach(({ items }) =>
      items?.forEach((item) => extractItemKeyWords(item)),
    );

    this.searchText = keyWords.filter((v) => !!v).join(' ');
  }
}
