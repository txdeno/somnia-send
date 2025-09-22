import { getDefaultConfig } from '@rainbow-me/rainbowkit';

const somniaMainnet = {
  id: 5031,
  name: 'SOMNIA MAINNET',
  nativeCurrency: {
    decimals: 18,
    name: 'SOMI',
    symbol: 'SOMI',
  },
  rpcUrls: {
    default: {
      http: ['https://api.infra.mainnet.somnia.network/'],
    },
    public: {
      http: ['https://api.infra.mainnet.somnia.network/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Somnia Explorer',
      url: 'https://mainnet.somnia.w3us.site/',
    },
  },
} as const;

export const config = getDefaultConfig({
  appName: 'Somnia Multisender',
  projectId: process.env.REACT_APP_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [somniaMainnet],
  ssr: false,
});