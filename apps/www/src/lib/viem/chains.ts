import { defineChain } from 'viem';

export const fhenixHelium = defineChain({
  id: 8008135,
  name: 'Fhenix Helium Testnet',
  nativeCurrency: { name: 'Fhenix', symbol: 'tFHE', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://api.helium.fhenix.zone'],
    },
  },
  testnet: true,
  blockExplorers: {
    default: {
      name: 'Block Explorer',
      url: 'https://explorer.helium.fhenix.zone',
    },
  },
});

export const localFhenix = defineChain({
  id: 412346,
  name: 'Local Fhenix',
  nativeCurrency: { name: 'Fhenix', symbol: 'tFHE', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:42069'],
    },
  },
  testnet: true,
  blockExplorers: {
    default: {
      name: 'Block Explorer',
      url: 'https://explorer.helium.fhenix.zone',
    },
  },
});
