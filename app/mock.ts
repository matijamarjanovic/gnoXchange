import { CoinDetails, NFTDetails, PoolInfo, Ticket, TokenDetails } from './types/types'

export const mockTickets: Ticket[] = [
  {
    id: 'swap-9',
    creator: 'g1ej0qca5ptsw9kfr64ey8jvfy9eacga6mpj2z0y',
    assetIn: {
      type: 'token',
      path: 'gno.land/r/matijamarjanovic/test.token-c',
      name: 'Token C',
      symbol: 'TOKC',
      decimals: 6
    },
    assetOut: {
      type: 'token',
      path: 'gno.land/r/matijamarjanovic/test.token-a',
      name: 'Token A',
      symbol: 'TOKA',
      decimals: 6
    },
    amountIn: 300000000,
    minAmountOut: 280000000,
    createdAt: '2025-02-12 21:42:22',
    expiresAt: '2025-02-15 21:42:22',
    status: 'open'
  },
  {
    id: 'swap-10',
    creator: 'g1ej0qca5ptsw9kfr64ey8jvfy9eacga6mpj2z0y',
    assetIn: {
      type: 'token',
      path: 'gno.land/r/matijamarjanovic/test.token-a',
      name: 'Token A',
      symbol: 'TOKA',
      decimals: 6
    },
    assetOut: {
      type: 'token',
      path: 'gno.land/r/matijamarjanovic/test.token-b',
      name: 'Token B',
      symbol: 'TOKB',
      decimals: 6
    },
    amountIn: 500000000,
    minAmountOut: 480000000,
    createdAt: '2025-02-12 22:42:22',
    expiresAt: '2025-02-15 22:42:22',
    status: 'fulfilled'
  },
  {
    id: 'swap-11',
    creator: 'g1ej0qca5ptsw9kfr64ey8jvfy9eacga6mpj2z0y',
    assetIn: {
      type: 'token',
      path: 'gno.land/r/matijamarjanovic/test.token-b',
      name: 'Token B',
      symbol: 'TOKB',
      decimals: 6
    },
    assetOut: {
      type: 'token',
      path: 'gno.land/r/matijamarjanovic/test.token-c',
      name: 'Token C',
      symbol: 'TOKC',
      decimals: 6
    },
    amountIn: 1000000000,
    minAmountOut: 950000000,
    createdAt: '2025-02-12 23:42:22',
    expiresAt: '2025-02-15 23:42:22',
    status: 'expired'
  },
  {
    id: 'swap-12',
    creator: 'g1ej0qca5ptsw9kfr64ey8jvfy9eacga6mpj2z0y',
    assetIn: {
      type: 'token',
      path: 'gno.land/r/matijamarjanovic/test.token-c',
      name: 'Token C',
      symbol: 'TOKC',
      decimals: 6
    },
    assetOut: {
      type: 'token',
      path: 'gno.land/r/matijamarjanovic/test.token-b',
      name: 'Token B',
      symbol: 'TOKB',
      decimals: 6
    },
    amountIn: 750000000,
    minAmountOut: 700000000,
    createdAt: '2025-02-13 00:42:22',
    expiresAt: '2025-02-16 00:42:22',
    status: 'cancelled'
  },
  {
    id: 'swap-13',
    creator: 'g1ej0qca5ptsw9kfr64ey8jvfy9eacga6mpj2z0y',
    assetIn: {
      type: 'token',
      path: 'gno.land/r/matijamarjanovic/test.token-a',
      name: 'Token A',
      symbol: 'TOKA',
      decimals: 6
    },
    assetOut: {
      type: 'token',
      path: 'gno.land/r/matijamarjanovic/test.token-c',
      name: 'Token C',
      symbol: 'TOKC',
      decimals: 6
    },
    amountIn: 250000000,
    minAmountOut: 240000000,
    createdAt: '2025-02-13 01:42:22',
    expiresAt: '2025-02-16 01:42:22',
    status: 'open'
  },
  {
    id: 'swap-14',
    creator: 'g1ej0qca5ptsw9kfr64ey8jvfy9eacga6mpj2z0y',
    assetIn: {
      type: 'token',
      path: 'gno.land/r/matijamarjanovic/test.token-b',
      name: 'Token B',
      symbol: 'TOKB',
      decimals: 6
    },
    assetOut: {
      type: 'token',
      path: 'gno.land/r/matijamarjanovic/test.token-a',
      name: 'Token A',
      symbol: 'TOKA',
      decimals: 6
    },
    amountIn: 400000000,
    minAmountOut: 380000000,
    createdAt: '2025-02-13 02:42:22',
    expiresAt: '2025-02-16 02:42:22',
    status: 'fulfilled'
  },
  {
    id: 'swap-15',
    creator: 'g1ej0qca5ptsw9kfr64ey8jvfy9eacga6mpj2z0y',
    assetIn: {
      type: 'token',
      path: 'gno.land/r/matijamarjanovic/test.token-c',
      name: 'Token C',
      symbol: 'TOKC',
      decimals: 6
    },
    assetOut: {
      type: 'token',
      path: 'gno.land/r/matijamarjanovic/test.token-a',
      name: 'Token A',
      symbol: 'TOKA',
      decimals: 6
    },
    amountIn: 600000000,
    minAmountOut: 580000000,
    createdAt: '2025-02-13 03:42:22',
    expiresAt: '2025-02-16 03:42:22',
    status: 'expired'
  },
  {
    id: 'swap-16',
    creator: 'g1ej0qca5ptsw9kfr64ey8jvfy9eacga6mpj2z0y',
    assetIn: {
      type: 'token',
      path: 'gno.land/r/matijamarjanovic/test.token-a',
      name: 'Token A',
      symbol: 'TOKA',
      decimals: 6
    },
    assetOut: {
      type: 'token',
      path: 'gno.land/r/matijamarjanovic/test.token-b',
      name: 'Token B',
      symbol: 'TOKB',
      decimals: 6
    },
    amountIn: 800000000,
    minAmountOut: 750000000,
    createdAt: '2025-02-13 04:42:22',
    expiresAt: '2025-02-16 04:42:22',
    status: 'cancelled'
  },
  {
    id: 'swap-17',
    creator: 'g1ej0qca5ptsw9kfr64ey8jvfy9eacga6mpj2z0y',
    assetIn: {
      type: 'token',
      path: 'gno.land/r/matijamarjanovic/test.token-b',
      name: 'Token B',
      symbol: 'TOKB',
      decimals: 6
    },
    assetOut: {
      type: 'token',
      path: 'gno.land/r/matijamarjanovic/test.token-c',
      name: 'Token C',
      symbol: 'TOKC',
      decimals: 6
    },
    amountIn: 900000000,
    minAmountOut: 850000000,
    createdAt: '2025-02-13 05:42:22',
    expiresAt: '2025-02-16 05:42:22',
    status: 'open'
  },
  {
    id: 'swap-18',
    creator: 'g1ej0qca5ptsw9kfr64ey8jvfy9eacga6mpj2z0y',
    assetIn: {
      type: 'token',
      path: 'gno.land/r/matijamarjanovic/test.token-c',
      name: 'Token C',
      symbol: 'TOKC',
      decimals: 6
    },
    assetOut: {
      type: 'token',
      path: 'gno.land/r/matijamarjanovic/test.token-b',
      name: 'Token B',
      symbol: 'TOKB',
      decimals: 6
    },
    amountIn: 450000000,
    minAmountOut: 430000000,
    createdAt: '2025-02-13 06:42:22',
    expiresAt: '2025-02-16 06:42:22',
    status: 'fulfilled'
  }
]

export const mockNFTTickets: Ticket[] = [
  {
    id: 'nfts-5',
    creator: 'g1ej0qca5ptsw9kfr64ey8jvfy9eacga6mpj2z0y',
    assetIn: {
      type: 'nft',
      tokenHubPath: 'gno.land/r/matijamarjanovic/test.nft-b.NFTB_2'
    },
    assetOut: {
      type: 'coin',
      denom: 'ugnot'
    },
    amountIn: 1,
    minAmountOut: 500000000,
    createdAt: '2025-02-12 21:54:52',
    expiresAt: '2025-02-13 21:54:52',
    status: 'expired'
  },
  {
    id: 'nfts-6',
    creator: 'g1ej0qca5ptsw9kfr64ey8jvfy9eacga6mpj2z0y',
    assetIn: {
      type: 'nft',
      tokenHubPath: 'gno.land/r/matijamarjanovic/test.nft-b.NFTB_3'
    },
    assetOut: {
      type: 'coin',
      denom: 'ugnot'
    },
    amountIn: 1,
    minAmountOut: 600000000,
    createdAt: '2025-02-12 22:54:52',
    expiresAt: '2025-02-13 22:54:52',
    status: 'cancelled'
  },
  {
    id: 'nfts-7',
    creator: 'g1ej0qca5ptsw9kfr64ey8jvfy9eacga6mpj2z0y',
    assetIn: {
      type: 'nft',
      tokenHubPath: 'gno.land/r/matijamarjanovic/test.nft-a.NFTA_1'
    },
    assetOut: {
      type: 'coin',
      denom: 'ugnot'
    },
    amountIn: 1,
    minAmountOut: 700000000,
    createdAt: '2025-02-12 23:54:52',
    expiresAt: '2025-02-13 23:54:52',
    status: 'open'
  },
  {
    id: 'nfts-8',
    creator: 'g1ej0qca5ptsw9kfr64ey8jvfy9eacga6mpj2z0y',
    assetIn: {
      type: 'nft',
      tokenHubPath: 'gno.land/r/matijamarjanovic/test.nft-c.NFTC_1'
    },
    assetOut: {
      type: 'coin',
      denom: 'ugnot'
    },
    amountIn: 1,
    minAmountOut: 450000000,
    createdAt: '2025-02-13 00:54:52',
    expiresAt: '2025-02-14 00:54:52',
    status: 'fulfilled'
  },
  {
    id: 'nfts-9',
    creator: 'g1ej0qca5ptsw9kfr64ey8jvfy9eacga6mpj2z0y',
    assetIn: {
      type: 'nft',
      tokenHubPath: 'gno.land/r/matijamarjanovic/test.nft-b.NFTB_4'
    },
    assetOut: {
      type: 'coin',
      denom: 'ugnot'
    },
    amountIn: 1,
    minAmountOut: 550000000,
    createdAt: '2025-02-13 01:54:52',
    expiresAt: '2025-02-14 01:54:52',
    status: 'expired'
  },
  {
    id: 'nfts-10',
    creator: 'g1ej0qca5ptsw9kfr64ey8jvfy9eacga6mpj2z0y',
    assetIn: {
      type: 'nft',
      tokenHubPath: 'gno.land/r/matijamarjanovic/test.nft-a.NFTA_2'
    },
    assetOut: {
      type: 'coin',
      denom: 'ugnot'
    },
    amountIn: 1,
    minAmountOut: 800000000,
    createdAt: '2025-02-13 02:54:52',
    expiresAt: '2025-02-14 02:54:52',
    status: 'cancelled'
  },
  {
    id: 'nfts-11',
    creator: 'g1ej0qca5ptsw9kfr64ey8jvfy9eacga6mpj2z0y',
    assetIn: {
      type: 'nft',
      tokenHubPath: 'gno.land/r/matijamarjanovic/test.nft-c.NFTC_2'
    },
    assetOut: {
      type: 'coin',
      denom: 'ugnot'
    },
    amountIn: 1,
    minAmountOut: 650000000,
    createdAt: '2025-02-13 03:54:52',
    expiresAt: '2025-02-14 03:54:52',
    status: 'open'
  },
  {
    id: 'nfts-12',
    creator: 'g1ej0qca5ptsw9kfr64ey8jvfy9eacga6mpj2z0y',
    assetIn: {
      type: 'nft',
      tokenHubPath: 'gno.land/r/matijamarjanovic/test.nft-b.NFTB_5'
    },
    assetOut: {
      type: 'coin',
      denom: 'ugnot'
    },
    amountIn: 1,
    minAmountOut: 900000000,
    createdAt: '2025-02-13 04:54:52',
    expiresAt: '2025-02-14 04:54:52',
    status: 'fulfilled'
  },
  {
    id: 'nfts-13',
    creator: 'g1ej0qca5ptsw9kfr64ey8jvfy9eacga6mpj2z0y',
    assetIn: {
      type: 'nft',
      tokenHubPath: 'gno.land/r/matijamarjanovic/test.nft-a.NFTA_3'
    },
    assetOut: {
      type: 'coin',
      denom: 'ugnot'
    },
    amountIn: 1,
    minAmountOut: 750000000,
    createdAt: '2025-02-13 05:54:52',
    expiresAt: '2025-02-14 05:54:52',
    status: 'expired'
  },
  {
    id: 'nfts-14',
    creator: 'g1ej0qca5ptsw9kfr64ey8jvfy9eacga6mpj2z0y',
    assetIn: {
      type: 'nft',
      tokenHubPath: 'gno.land/r/matijamarjanovic/test.nft-c.NFTC_3'
    },
    assetOut: {
      type: 'coin',
      denom: 'ugnot'
    },
    amountIn: 1,
    minAmountOut: 850000000,
    createdAt: '2025-02-13 06:54:52',
    expiresAt: '2025-02-14 06:54:52',
    status: 'cancelled'
  }
]

export const mockTokenDetails: TokenDetails[] = [
  {
    key: 'gno.land/r/test.gtoken',
    name: 'Test Token',
    symbol: 'TT',
    decimals: 6
  },
  {
    key: 'gno.land/r/test2.gtokenB',
    name: 'Test Token B',
    symbol: 'TTB',
    decimals: 8
  },
  {
    key: 'gno.land/r/test3.gtokenC',
    name: 'Test Token C',
    symbol: 'TTC',
    decimals: 4
  },
  {
    key: 'gno.land/r/test4.gtokenD',
    name: 'Test Token D',
    symbol: 'TTD',
    decimals: 18
  },
  {
    key: 'gno.land/r/test5.gtokenE',
    name: 'Test Token E',
    symbol: 'TTE',
    decimals: 2
  },
  {
    key: 'gno.land/r/test6.gtokenF',
    name: 'Test Token F',
    symbol: 'TTF',
    decimals: 10
  },
  {
    key: 'gno.land/r/test7.gtokenG',
    name: 'Test Token G',
    symbol: 'TTG',
    decimals: 12
  }
] 

export const mockCoinDetails: CoinDetails[] = [
  {
    denom: 'ugnot',
    name: 'GNOT',
    decimals: 6
  }
]

export const mockNFTDetails: NFTDetails[] = [
  {
    key: 'gno.land/r/test.nft.mycollection.1',
    collection: 'My Collection',
    tokenId: 'NFT1',
    uri: 'gno.land/r/test.nft.mycollection.1'
  },
  {
    key: 'gno.land/r/test.nft.mycollection.2',
    collection: 'My Collection',
    tokenId: 'NFT2',
    uri: 'gno.land/r/test.nft.mycollection.2'
  },
  {
    key: 'gno.land/r/test.nft.mycollection.3',
    collection: 'My Collection',
    tokenId: 'NFT3',
    uri: 'gno.land/r/test.nft.mycollection.3'
  }
]

export const mockPools: PoolInfo[] = [
  {
    poolKey: "pool_toka_tokb",
    tokenAInfo: {
      key: "gno.land/r/demo/token_a",
      name: "Token A",
      symbol: "TOKA",
      decimals: 6
    },
    tokenBInfo: {
      key: "gno.land/r/demo/token_b",
      name: "Token B",
      symbol: "TOKB",
      decimals: 6
    },
    reserveA: 1000000000,  // 1000 TOKA
    reserveB: 2000000000,  // 2000 TOKB
    totalSupplyLP: 1414213562 // sqrt(1000 * 2000) * 1000000
  },
  {
    poolKey: "pool_tokb_tokc",
    tokenAInfo: {
      key: "gno.land/r/demo/token_b",
      name: "Token B",
      symbol: "TOKB",
      decimals: 6
    },
    tokenBInfo: {
      key: "gno.land/r/demo/token_c",
      name: "Token C",
      symbol: "TOKC",
      decimals: 6
    },
    reserveA: 5000000000,  // 5000 TOKB
    reserveB: 10000000000, // 10000 TOKC
    totalSupplyLP: 7071067810
  },
  {
    poolKey: "pool_tokc_tokd",
    tokenAInfo: {
      key: "gno.land/r/demo/token_c",
      name: "Token C",
      symbol: "TOKC",
      decimals: 6
    },
    tokenBInfo: {
      key: "gno.land/r/demo/token_d",
      name: "Token D",
      symbol: "TOKD",
      decimals: 6
    },
    reserveA: 3000000000,  // 3000 TOKC
    reserveB: 1500000000,  // 1500 TOKD
    totalSupplyLP: 2121320344
  },
  {
    poolKey: "pool_tokd_toke",
    tokenAInfo: {
      key: "gno.land/r/demo/token_d",
      name: "Token D",
      symbol: "TOKD",
      decimals: 6
    },
    tokenBInfo: {
      key: "gno.land/r/demo/token_e",
      name: "Token E",
      symbol: "TOKE",
      decimals: 6
    },
    reserveA: 8000000000,  // 8000 TOKD
    reserveB: 4000000000,  // 4000 TOKE
    totalSupplyLP: 5656854249
  },
  {
    poolKey: "pool_toke_tokf",
    tokenAInfo: {
      key: "gno.land/r/demo/token_e",
      name: "Token E",
      symbol: "TOKE",
      decimals: 6
    },
    tokenBInfo: {
      key: "gno.land/r/demo/token_f",
      name: "Token F",
      symbol: "TOKF",
      decimals: 6
    },
    reserveA: 6000000000,  // 6000 TOKE
    reserveB: 3000000000,  // 3000 TOKF
    totalSupplyLP: 4242640687
  },
  {
    poolKey: "pool_toka_tokc",
    tokenAInfo: {
      key: "gno.land/r/demo/token_a",
      name: "Token A",
      symbol: "TOKA",
      decimals: 6
    },
    tokenBInfo: {
      key: "gno.land/r/demo/token_c",
      name: "Token C",
      symbol: "TOKC",
      decimals: 6
    },
    reserveA: 4000000000,  // 4000 TOKA
    reserveB: 8000000000,  // 8000 TOKC
    totalSupplyLP: 5656854249
  },
  {
    poolKey: "pool_tokb_tokd",
    tokenAInfo: {
      key: "gno.land/r/demo/token_b",
      name: "Token B",
      symbol: "TOKB",
      decimals: 6
    },
    tokenBInfo: {
      key: "gno.land/r/demo/token_d",
      name: "Token D",
      symbol: "TOKD",
      decimals: 6
    },
    reserveA: 7000000000,  // 7000 TOKB
    reserveB: 3500000000,  // 3500 TOKD
    totalSupplyLP: 4949747468
  },
  {
    poolKey: "pool_tokc_toke",
    tokenAInfo: {
      key: "gno.land/r/demo/token_c",
      name: "Token C",
      symbol: "TOKC",
      decimals: 6
    },
    tokenBInfo: {
      key: "gno.land/r/demo/token_e",
      name: "Token E",
      symbol: "TOKE",
      decimals: 6
    },
    reserveA: 9000000000,  // 9000 TOKC
    reserveB: 4500000000,  // 4500 TOKE
    totalSupplyLP: 6363961031
  },
  {
    poolKey: "pool_tokd_tokf",
    tokenAInfo: {
      key: "gno.land/r/demo/token_d",
      name: "Token D",
      symbol: "TOKD",
      decimals: 6
    },
    tokenBInfo: {
      key: "gno.land/r/demo/token_f",
      name: "Token F",
      symbol: "TOKF",
      decimals: 6
    },
    reserveA: 5500000000,  // 5500 TOKD
    reserveB: 2750000000,  // 2750 TOKF
    totalSupplyLP: 3889087296
  },
  {
    poolKey: "pool_toka_tokf",
    tokenAInfo: {
      key: "gno.land/r/demo/token_a",
      name: "Token A",
      symbol: "TOKA",
      decimals: 6
    },
    tokenBInfo: {
      key: "gno.land/r/demo/token_f",
      name: "Token F",
      symbol: "TOKF",
      decimals: 6
    },
    reserveA: 3300000000,  // 3300 TOKA
    reserveB: 6600000000,  // 6600 TOKF
    totalSupplyLP: 4666904755
  }
]
