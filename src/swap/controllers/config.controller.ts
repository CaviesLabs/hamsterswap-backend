import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SwapPlatformConfigEntity } from '../entities/swap-platform-config.entity';

@Controller('platform-config')
@ApiTags('swap')
export class SwapConfigController {
  @Get()
  getConfig(): SwapPlatformConfigEntity {
    return {
      maxAllowedOptions: 4,
      maxAllowedItems: 4,
      allowCurrencies: [
        {
          id: 'So11111111111111111111111111111111111111112',
          image:
            'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
          name: 'Solana',
          type: 'token',
        },
        {
          id: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
          image:
            'https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I',
          name: 'Bonk',
          type: 'token',
        },
        {
          id: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
          image:
            'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
          name: 'USD Coin',
          type: 'token',
        },
      ],
      allowNTFCollections: [
        {
          id: '3cf5721fbaf1a81f69c6eeb833840e44e99955854d22f53ccd903581552e8e73',
          image:
            'https://www.arweave.net/56qWrf1lml3Bb5XgS_Ltlqtoaf3s0Qmu7t5OGMwN7DI?ext=png',
          type: 'nft-collection',
          name: 'Ancient 8 - The Generals',
        },
        {
          id: 'a38e8d9d1a16b625978803a7d4eb512bc20ff880c8fd6cc667944a3d7b5e4acf',
          image: 'https://metadata.degods.com/g/9999-dead.png',
          type: 'nft-collection',
          name: 'DeGods',
        },
        {
          id: 'b87cf16fde5ea9117831766cd0ca86f7ec7cc86aa78199ec26a81d5e37dee369',
          image:
            'https://nftstorage.link/ipfs/bafybeidklga2k23b7zxtlna5rcp2casiktfndvsxynimucwiiyvcgpqq54/84.png',
          type: 'nft-collection',
          name: 'Just tiger',
        },
        {
          id: '2e44513374fb2e104fae68c9253432a143f5f3ec6e3549fa8235d06d77e7cddc',
          image:
            'https://nftstorage.link/ipfs/bafybeifwgtllf23btjjxfg72rhyuejo46jffm2mdr3mep4faewxferyqka/536.png',
          type: 'nft-collection',
          name: 'Lurker',
        },
        {
          id: '903c2d6bb7b35fc58e9df37a4367dcbbafb905d08bdfdf7394544105b8d83106',
          image:
            'https://nftstorage.link/ipfs/bafybeicvgxmua6v42tfek5llzw4vtqch43i4li3r7giqo7ebisndxytnuu/399.jpeg',
          type: 'nft-collection',
          name: 'AngryCats',
        },
        {
          id: '47000db61c42e7613bf36f1fed177cbbb378b5ad61dfc4f06d1e80a8ad0aed9f',
          image:
            'https://nftstorage.link/ipfs/bafybeib7z3rbaodrg6l6zpypaamxxof3antmflllcfxt6vitovhh25ukyi/8690.png',
          type: 'nft-collection',
          name: 'Hasuki',
        },
        {
          id: '951e97fc5b24026c3e6cab1de6810a5a9c1e936baa149e6e17a5d76a2dc8c273',
          image:
            'https://arweave.net/2CjjpF34uCI59Ab2jc017KMmqWKkZjZsLg8wLeOEb3s',
          type: 'nft-collection',
          name: 'Fatal Foxes',
        },
        {
          id: 'c5491b3157ba13c779a0eca399572489d3cdd6daae6d5eb2d7ae1d599a012703',
          image:
            'https://nftstorage.link/ipfs/bafybeif7ydqzsfh44plj6jzl5emix6wkoviiri6ocydjk6lk3on65tdbhu/253.jpeg',
          type: 'nft-collection',
          name: 'Splatter Kids',
        },
        {
          id: 'c3e7928c1fad8ecb945fa365e4a7e485fead5d9db5b0b7a7d41c52f427e62a35',
          image:
            'https://www.arweave.net/t-ZGgtMW2-CFEEKLCrCk6UONh4yDW5yZKChcoRFoxs0?ext=png',
          type: 'nft-collection',
          name: 'Skully Boys',
        },
        {
          id: '8c7df16222c60acf07d026a392e61dd15829e5da9902d3ba53977520bc25aa0f',
          image:
            'https://arweave.net/Qzk6lNgzj_ylmjyvVWwE3mO_k-Q5nX9Uge2aC0MwDw4/2003.png',
          type: 'nft-collection',
          name: 'Degen Strays Club',
        },
        {
          id: 'be8d3f2975099d695c3b3414fedd95f85436ccd84687c1bbc0cc9e1175c704ba',
          image:
            'https://bitmon-images.bitmon.io/8emdpbxVaDZeixfTScGQFgdfwSaZKqHxPNs3vwjmGXc.png',
          type: 'nft-collection',
          name: 'Bitmons',
        },
      ],
    };
  }
}
