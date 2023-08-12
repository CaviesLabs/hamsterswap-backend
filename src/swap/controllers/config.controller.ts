import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  ChainConfigEntity,
  SwapPlatformConfigEntity,
} from '../entities/swap-platform-config.entity';
import { RegistryProvider } from '../../providers/registry.provider';

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
          decimals: 9,
        },
        {
          id: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
          image:
            'https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I',
          name: 'Bonk',
          type: 'token',
          decimals: 5,
        },
        {
          id: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
          image:
            'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
          name: 'USD Coin',
          type: 'token',
          decimals: 6,
        },
      ],
      allowNTFCollections: [
        {
          idList: [
            '3cf5721fbaf1a81f69c6eeb833840e44e99955854d22f53ccd903581552e8e73',
          ],
          image:
            'https://www.arweave.net/56qWrf1lml3Bb5XgS_Ltlqtoaf3s0Qmu7t5OGMwN7DI?ext=png',
          type: 'nft-collection',
          name: 'Ancient 8 - The Generals',
        },
        {
          idList: [
            'a38e8d9d1a16b625978803a7d4eb512bc20ff880c8fd6cc667944a3d7b5e4acf',
          ],
          image: 'https://metadata.degods.com/g/9999-dead.png',
          type: 'nft-collection',
          name: 'DeGods',
        },
        {
          idList: [
            'b87cf16fde5ea9117831766cd0ca86f7ec7cc86aa78199ec26a81d5e37dee369',
          ],
          image:
            'https://nftstorage.link/ipfs/bafybeidklga2k23b7zxtlna5rcp2casiktfndvsxynimucwiiyvcgpqq54/84.png',
          type: 'nft-collection',
          name: 'Just tiger',
        },
        {
          idList: [
            '2e44513374fb2e104fae68c9253432a143f5f3ec6e3549fa8235d06d77e7cddc',
          ],
          image:
            'https://nftstorage.link/ipfs/bafybeifwgtllf23btjjxfg72rhyuejo46jffm2mdr3mep4faewxferyqka/536.png',
          type: 'nft-collection',
          name: 'Lurker',
        },
        {
          idList: [
            '903c2d6bb7b35fc58e9df37a4367dcbbafb905d08bdfdf7394544105b8d83106',
            'ab1b1471c5777b22cfe5ed92f8f735d85daedc1a68ced613886211aaf0941625',
          ],
          image:
            'https://nftstorage.link/ipfs/bafybeicvgxmua6v42tfek5llzw4vtqch43i4li3r7giqo7ebisndxytnuu/399.jpeg',
          type: 'nft-collection',
          name: 'AngryCats',
        },
        {
          idList: [
            '47000db61c42e7613bf36f1fed177cbbb378b5ad61dfc4f06d1e80a8ad0aed9f',
          ],
          image:
            'https://nftstorage.link/ipfs/bafybeib7z3rbaodrg6l6zpypaamxxof3antmflllcfxt6vitovhh25ukyi/8690.png',
          type: 'nft-collection',
          name: 'Hasuki',
        },
        {
          idList: [
            '951e97fc5b24026c3e6cab1de6810a5a9c1e936baa149e6e17a5d76a2dc8c273',
          ],
          image:
            'https://arweave.net/2CjjpF34uCI59Ab2jc017KMmqWKkZjZsLg8wLeOEb3s',
          type: 'nft-collection',
          name: 'Fatal Foxes',
        },
        {
          idList: [
            'c5491b3157ba13c779a0eca399572489d3cdd6daae6d5eb2d7ae1d599a012703',
          ],
          image:
            'https://nftstorage.link/ipfs/bafybeif7ydqzsfh44plj6jzl5emix6wkoviiri6ocydjk6lk3on65tdbhu/253.jpeg',
          type: 'nft-collection',
          name: 'Splatter Kids',
        },
        {
          idList: [
            'c3e7928c1fad8ecb945fa365e4a7e485fead5d9db5b0b7a7d41c52f427e62a35',
          ],
          image:
            'https://www.arweave.net/t-ZGgtMW2-CFEEKLCrCk6UONh4yDW5yZKChcoRFoxs0?ext=png',
          type: 'nft-collection',
          name: 'Skully Boys',
        },
        {
          idList: [
            '8c7df16222c60acf07d026a392e61dd15829e5da9902d3ba53977520bc25aa0f',
          ],
          image:
            'https://arweave.net/Qzk6lNgzj_ylmjyvVWwE3mO_k-Q5nX9Uge2aC0MwDw4/2003.png',
          type: 'nft-collection',
          name: 'Degen Strays Club',
        },
        {
          idList: [
            'be8d3f2975099d695c3b3414fedd95f85436ccd84687c1bbc0cc9e1175c704ba',
            '719cc0af4aeba42cb24c2053425a3969b3cd28a6f8b797be64f31c413edcad6d',
          ],
          image:
            'https://bitmon-images.bitmon.io/8emdpbxVaDZeixfTScGQFgdfwSaZKqHxPNs3vwjmGXc.png',
          type: 'nft-collection',
          name: 'Bitmons',
        },
      ],
    };
  }

  @Get('chain-config')
  getChainConfig() {
    const registry = new RegistryProvider();

    return {
      klaytn: {
        wagmiKey: 'klaytn',
        chainName: 'Klaytn',
        chainLogo:
          'https://assets.coingecko.com/coins/images/9672/small/klaytn.png?1660288824',
        rpcUrl: registry.getConfig().NETWORKS['klaytn'].RPC_URL,
        chainId: registry.getConfig().NETWORKS['klaytn'].CHAIN_ID,
        programAddress:
          registry.getConfig().NETWORKS['klaytn'].SWAP_PROGRAM_ADDRESS,
        explorerUrl: 'https://scope.klaytn.com/',
        maxAllowedItems: 4,
        maxAllowedOptions: 4,
        currencies: [
          {
            explorerUrl:
              'https://scope.klaytn.com/token/0xe4f05a66ec68b54a58b17c22107b02e0232cc817',
            currencyId: 'klay-token',
            address: '0xe4f05A66Ec68B54A58B17c22107b02e0232cC817',
            logo: 'https://assets.coingecko.com/coins/images/9672/small/klaytn.png?1660288824',
            name: 'Klaytn',
            symbol: 'WKLAY',
            decimals: 18,
          },
          {
            explorerUrl:
              'https://scope.klaytn.com/token/0xceE8FAF64bB97a73bb51E115Aa89C17FfA8dD167',
            address: '0xceE8FAF64bB97a73bb51E115Aa89C17FfA8dD167',
            decimals: 6,
            logo: 'https://assets.coingecko.com/coins/images/26273/small/-p1Br7oh_400x400.png?1656999148',
            name: 'Orbit USDT',
            symbol: 'oUSDT',
            currencyId: 'orbit-bridge-klaytn-usd-tether',
          },
        ],
        collections: [
          {
            marketUrl: 'https://opensea.io/collection/bellygom-world-official',
            addresses: ['0xce70eef5adac126c37c8bc0c1228d48b70066d03'],
            logo: 'https://i.seadn.io/gcs/files/ed4380136946111c0a73f0f18ede3700.gif?auto=format&dpr=1&w=384',
            collectionId: 'bellygom-world-official',
            name: 'Bellygom World Official',
          },
          {
            marketUrl: 'https://opensea.io/collection/archeworld-land',
            addresses: ['0x56d23f924cd526e5590ed94193a892e913e38079'],
            logo: 'https://i.seadn.io/gae/EnWOIzcAQvlAD-a8iy3AUkQI49FpMOXHodZ8RvbNpong8hqM63b-SNDKlAlNJpL7Y4KbCRG80yuI4tjW83eQhWpIS2QDyavB8TzokA?auto=format&dpr=1&w=384',
            collectionId: 'archeworld-land',
            name: 'ArcheWorld_Land',
          },
          {
            marketUrl: 'https://opensea.io/collection/puuvillasociety',
            addresses: ['0xd643bb39f81ff9079436f726d2ed27abc547cb38'],
            logo: 'https://i.seadn.io/gcs/files/a629b31802a5a824912c33cccfd7497f.png?auto=format&dpr=1&w=384',
            collectionId: 'puuvillasociety',
            name: 'PuuvillaSociety',
          },
          {
            marketUrl: 'https://opensea.io/collection/dogesoundclub-mates',
            addresses: ['0xe47e90c58f8336a2f24bcd9bcb530e2e02e1e8ae'],
            logo: 'https://i.seadn.io/gae/GFwdjFVKsdzLH_4l4yb2wriUTpxP13-SfxxCL1zFX-xd2PrsYtjM3ZSsoI_iRBzBeA_0AV-hq3b4M81iuQ5SOzobf92SYViuHDIh?auto=format&dpr=1&w=384',
            collectionId: 'dogesoundclub-mates',
            name: 'DSC | DOGESOUNDCLUB MATES',
          },
          {
            marketUrl: 'https://opensea.io/collection/the-snkrz-nft',
            addresses: ['0x2da32c00c3d0a77623cb13a371b24fffbafda4a7'],
            logo: 'https://i.seadn.io/gcs/files/7d1a6b28f6c35d75248fdfd8948a5f5f.png?auto=format&dpr=1&w=384',
            collectionId: 'the-snkrz-nft',
            name: 'THE SNKRZ NFT',
          },
          {
            marketUrl: 'https://opensea.io/collection/sunmiya-club-official',
            addresses: ['0x8f5aa6b6dcd2d952a22920e8fe3f798471d05901'],
            logo: 'https://i.seadn.io/gae/UEltltZRWTPLVS05D6KYdo18nEZ7Ba4n8rj_OlDh8mnM3_oWassvQ0VDCqCMHHMDe2MruYUVOHhu5MGBRk40Sg09C-M8z3IIZPD8?auto=format&dpr=1&w=384',
            collectionId: 'sunmiya-club-official',
            name: 'Sunmiya Club Official',
          },
          {
            marketUrl: 'https://opensea.io/collection/syltare-official',
            addresses: ['0x6b8f71aa8d5817d94056103886a1f07d12e78ce5'],
            logo: 'https://i.seadn.io/gae/riYV0mtDcxosNw5Z6d_AdBAd-tZJgjZNmSAJkVaW538rjtp0LVZFqCmre-73oVU-L_a4eR0ReOAXJX848IeqTr2dPJ7aQ1gM8iXM?auto=format&dpr=1&w=384',
            collectionId: 'syltare-official',
            name: 'SYLTARE-OFFICIAL',
          },
          {
            marketUrl: 'https://opensea.io/collection/g-rilla-official',
            addresses: ['0x46dbdc7965cf3cd2257c054feab941a05ff46488'],
            logo: 'https://i.seadn.io/gae/97GgxcGM-qnu20xEe0sPH1DlIHJB3R6tFcmkowW287_hXeala1o0Tu-AyHksa9DE5Q3npRbevahOkBGY7Fp9a4BFVMRK7N5vdvufDw?auto=format&dpr=1&w=384',
            collectionId: 'g-rilla-official',
            name: 'Mutant Kongz & G.rilla Official',
          },
          {
            marketUrl: 'https://opensea.io/collection/mtdz-1',
            addresses: ['0x46dbdc7965cf3cd2257c054feab941a05ff46488'],
            logo: 'https://i.seadn.io/gcs/files/cf5c7e5cd3f6808a1adbdaecce2f453b.gif?auto=format&dpr=1&w=384',
            collectionId: 'mtdz1',
            name: 'Meta Toy DragonZ',
          },
          {
            marketUrl: 'https://opensea.io/collection/the-meta-kongz-klaytn',
            addresses: ['0x5a293a1e234f4c26251fa0c69f33c83c38c091ff'],
            logo: 'https://i.seadn.io/gae/AX_uuKN-OFhtHXtzw5PJ3K-bGW5tg2svacBEv8xO_ii3UCEo6UTjqec4MiXFGP3gsxPD-p-W0d315pEvIOxG3pKNWfT3G8KvAgIl?auto=format&dpr=1&w=384',
            collectionId: 'the-meta-kongz-klaytn',
            name: 'THE META KONGZ KLAYTN',
          },
        ],
      },
      solana: {
        chainName: 'Solana',
        chainLogo:
          'https://assets.coingecko.com/coins/images/4128/small/solana.png',
        rpcUrl: registry.getConfig().NETWORKS['solana'].RPC_URL,
        explorerUrl: 'https://solscan.io/',
        programAddress:
          registry.getConfig().NETWORKS['solana'].SWAP_PROGRAM_ADDRESS,
        maxAllowedItems: 4,
        maxAllowedOptions: 4,
        collections: [
          {
            marketUrl: 'https://magiceden.io/marketplace/ancient8',
            addresses: [
              '3cf5721fbaf1a81f69c6eeb833840e44e99955854d22f53ccd903581552e8e73',
            ],
            logo: 'https://www.arweave.net/56qWrf1lml3Bb5XgS_Ltlqtoaf3s0Qmu7t5OGMwN7DI?ext=png',
            collectionId: 'ancient8',
            name: 'Ancient 8 - The Generals',
          },
          {
            marketUrl: 'https://magiceden.io/marketplace/degods',
            addresses: [
              'a38e8d9d1a16b625978803a7d4eb512bc20ff880c8fd6cc667944a3d7b5e4acf',
            ],
            logo: 'https://metadata.degods.com/g/9999-dead.png',
            collectionId: 'degods',
            name: 'DeGods',
          },
          {
            marketUrl: 'https://magiceden.io/marketplace/just_tiger',
            addresses: [
              'b87cf16fde5ea9117831766cd0ca86f7ec7cc86aa78199ec26a81d5e37dee369',
            ],
            logo: 'https://nftstorage.link/ipfs/bafybeidklga2k23b7zxtlna5rcp2casiktfndvsxynimucwiiyvcgpqq54/84.png',
            collectionId: 'just-tiger',
            name: 'Just tiger',
          },
          {
            marketUrl: 'https://magiceden.io/marketplace/lurkers',
            addresses: [
              '2e44513374fb2e104fae68c9253432a143f5f3ec6e3549fa8235d06d77e7cddc',
            ],
            logo: 'https://nftstorage.link/ipfs/bafybeifwgtllf23btjjxfg72rhyuejo46jffm2mdr3mep4faewxferyqka/536.png',
            collectionId: 'lurker',
            name: 'Lurker',
          },
          {
            marketUrl: 'https://magiceden.io/marketplace/angry_cats_',
            addresses: [
              '903c2d6bb7b35fc58e9df37a4367dcbbafb905d08bdfdf7394544105b8d83106',
              'ab1b1471c5777b22cfe5ed92f8f735d85daedc1a68ced613886211aaf0941625',
            ],
            logo: 'https://nftstorage.link/ipfs/bafybeicvgxmua6v42tfek5llzw4vtqch43i4li3r7giqo7ebisndxytnuu/399.jpeg',
            collectionId: 'angry-cats',
            name: 'AngryCats',
          },
          {
            marketUrl: 'https://magiceden.io/marketplace/hasuki',
            addresses: [
              '47000db61c42e7613bf36f1fed177cbbb378b5ad61dfc4f06d1e80a8ad0aed9f',
            ],
            logo: 'https://nftstorage.link/ipfs/bafybeib7z3rbaodrg6l6zpypaamxxof3antmflllcfxt6vitovhh25ukyi/8690.png',
            collectionId: 'hasuki',
            name: 'Hasuki',
          },
          {
            marketUrl: 'https://magiceden.io/marketplace/fatalfoxesnft',
            addresses: [
              '951e97fc5b24026c3e6cab1de6810a5a9c1e936baa149e6e17a5d76a2dc8c273',
            ],
            logo: 'https://arweave.net/2CjjpF34uCI59Ab2jc017KMmqWKkZjZsLg8wLeOEb3s',
            collectionId: 'fatal-foxes',
            name: 'Fatal Foxes',
          },
          {
            marketUrl: 'https://magiceden.io/marketplace/splatterkids',
            collectionId: 'splatter-kids',
            addresses: [
              'c5491b3157ba13c779a0eca399572489d3cdd6daae6d5eb2d7ae1d599a012703',
            ],
            name: 'Splatter Kids',
            logo: 'https://nftstorage.link/ipfs/bafybeif7ydqzsfh44plj6jzl5emix6wkoviiri6ocydjk6lk3on65tdbhu/253.jpeg',
          },
          {
            marketUrl:
              'https://magiceden.io/marketplace/skully_boys_bones_club',
            collectionId: 'skully-boy-bones-club',
            addresses: [
              'c3e7928c1fad8ecb945fa365e4a7e485fead5d9db5b0b7a7d41c52f427e62a35',
            ],
            name: 'Skully Boys Bones Club',
            logo: 'https://www.arweave.net/t-ZGgtMW2-CFEEKLCrCk6UONh4yDW5yZKChcoRFoxs0?ext=png',
          },
          {
            marketUrl: 'https://magiceden.io/marketplace/degen_strays_club',
            collectionId: 'degen-strays-club',
            addresses: [
              '8c7df16222c60acf07d026a392e61dd15829e5da9902d3ba53977520bc25aa0f',
            ],
            name: 'Degen Strays Club',
            logo: 'https://arweave.net/Qzk6lNgzj_ylmjyvVWwE3mO_k-Q5nX9Uge2aC0MwDw4/2003.png',
          },
          {
            marketUrl: 'https://magiceden.io/marketplace/bitmon_creatures',
            collectionId: 'bitmon-creatures',
            addresses: [
              'be8d3f2975099d695c3b3414fedd95f85436ccd84687c1bbc0cc9e1175c704ba',
              '719cc0af4aeba42cb24c2053425a3969b3cd28a6f8b797be64f31c413edcad6d',
            ],
            name: 'Bitmons',
            logo: 'https://bitmon-images.bitmon.io/8emdpbxVaDZeixfTScGQFgdfwSaZKqHxPNs3vwjmGXc.png',
          },
        ],
        currencies: [
          {
            explorerUrl:
              'https://solscan.io/token/So11111111111111111111111111111111111111112',
            currencyId: 'solana',
            address: 'So11111111111111111111111111111111111111112',
            logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
            name: 'Solana',
            symbol: 'WSOL',
            decimals: 9,
          },
          {
            explorerUrl:
              'https://solscan.io/token/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
            currencyId: 'bonk',
            address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
            image:
              'https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I',
            name: 'Bonk',
            symbol: 'BONK',
            decimals: 5,
          },
          {
            explorerUrl:
              'https://solscan.io/token/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
            currencyId: 'usd-coin',
            address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
            image:
              'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
            name: 'USD Coin',
            symbol: 'USDC',
            decimals: 6,
          },
        ],
      },
    } as ChainConfigEntity;
  }
}
