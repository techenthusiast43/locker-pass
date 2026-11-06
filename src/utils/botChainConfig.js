import { defineChain } from 'viem';

/**
 * BOT Chain Testnet Configuration
 * Chain ID: 968 (0x3c8)
 * RPC: https://rpc.bohr.life
 * Native Token: BOT
 * Total Supply: 150 Million
 * Explorer: https://scan.bohr.life/
 */
export const botChainTestnet = defineChain({
  id: 968,
  name: 'BOT Chain Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'BOT',
    symbol: 'BOT',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.bohr.life'],
    },
    public: {
      http: ['https://rpc.bohr.life'],
    },
  },
  blockExplorers: {
    default: {
      name: 'BOT Scan',
      url: 'https://scan.bohr.life',
    },
  },
  testnet: true,
});

export const BOT_CHAIN_ID = 968;
export const BOT_CHAIN_HEX_ID = '0x3c8';
export const BOT_CHAIN_RPC = 'https://rpc.bohr.life';
export const BOT_CHAIN_EXPLORER = 'https://scan.bohr.life';
export const BOT_NATIVE_TOKEN = 'BOT';
export const BOT_TOTAL_SUPPLY = '150,000,000 BOT';

export const BOT_CHAIN_PARAMS = {
  chainId: BOT_CHAIN_HEX_ID,
  chainName: 'BOT Chain Testnet',
  nativeCurrency: {
    name: 'BOT',
    symbol: 'BOT',
    decimals: 18,
  },
  rpcUrls: [BOT_CHAIN_RPC],
  blockExplorerUrls: [BOT_CHAIN_EXPLORER],
};

