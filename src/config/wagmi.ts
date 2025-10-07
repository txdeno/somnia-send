import { defineChain } from "viem";
import { createConfig, http, injected } from "wagmi";

const RPC_URL = "https://api.infra.mainnet.somnia.network/";

const somniaMainnet = defineChain({
  id: 5031,
  name: "SOMNIA MAINNET",
  nativeCurrency: {
    decimals: 18,
    name: "SOMI",
    symbol: "SOMI",
  },
  rpcUrls: {
    default: {
      http: [RPC_URL],
    },
    public: {
      http: [RPC_URL],
    },
  },
  blockExplorers: {
    default: {
      name: "Somnia Explorer",
      url: "https://explorer.somnia.network/",
    },
  },
});

export const config = createConfig({
  chains: [somniaMainnet],
  transports: {
    [somniaMainnet.id]: http(RPC_URL),
  },
  ssr: false,
  connectors: [injected({ shimDisconnect: true })],
});
