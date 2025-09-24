# Somnia Multisender DApp

A decentralized application for sending SOMI tokens or ERC20 tokens to multiple recipients in a single transaction on the Somnia Network.

## Features

- **Bulk Token Distribution**: Send native SOMI or ERC20 tokens to multiple addresses
- **Somnia Network Integration**: Built specifically for Somnia Mainnet (Chain ID: 5031)
- **Wallet Integration**: Connect with MetaMask and other Web3 wallets via RainbowKit
- **Smart Contract Interface**: Configurable contract address and ABI
- **CSV File Upload**: Import recipients from CSV files with validation
- **Transaction Tracking**: View transactions on Somnia Explorer

## Network Details

- **Network Name**: SOMNIA MAINNET
- **Chain ID**: 5031
- **RPC URL**: https://api.infra.mainnet.somnia.network/
- **Explorer**: https://explorer.somnia.network/
- **Native Token**: SOMI

## Smart Contract Functions

The DApp expects a smart contract with the following functions:

```solidity
function disperseNative(address[] memory recipients, uint256[] memory values) external payable;
function disperseToken(IERC20 token, address[] memory recipients, uint256[] memory values) external;
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   ```

   Update `.env` with your values:
   - `REACT_APP_WALLETCONNECT_PROJECT_ID`: Get from [WalletConnect Cloud](https://cloud.walletconnect.com/)
   - `REACT_APP_CONTRACT_ADDRESS`: Your multisender contract address
   - `REACT_APP_CONTRACT_ABI`: Your contract ABI as JSON string

3. Start the development server:
   ```bash
   npm start
   ```

## Usage

1. **Connect Wallet**: Click "Connect Wallet" and select your preferred wallet
2. **Add Recipients**:
   - Upload a CSV file (address, amount format)
   - Use manual text input (format: `address, amount` per line)
   - Or add recipients individually using the form
3. **Select Token Type**: Choose between native SOMI or ERC20 tokens
4. **Execute Transaction**: Review details and click "Disperse"

## Environment Variables

The app uses the following environment variables:

- `REACT_APP_WALLETCONNECT_PROJECT_ID`: Your WalletConnect project ID
- `REACT_APP_CONTRACT_ADDRESS`: The multisender contract address
- `REACT_APP_CONTRACT_ABI`: The contract ABI as a JSON string

## Project Structure

```
src/
├── components/
│   ├── Navigation.tsx        # Navigation bar with Somnia branding
│   ├── ContractConfig.tsx    # Contract configuration panel
│   ├── RecipientInput.tsx    # Recipient input interface (CSV, manual, forms)
│   └── TransactionPanel.tsx  # Transaction execution panel
├── config/
│   └── wagmi.ts             # Web3 configuration
├── types/
│   └── index.ts             # TypeScript type definitions
├── App.tsx                  # Main application component
└── index.tsx               # Application entry point
```

## Technologies Used

- **React 18** with TypeScript
- **Wagmi** for Ethereum interactions
- **RainbowKit** for wallet connections
- **Viem** for Ethereum utilities
- **Tailwind CSS** for styling
- **TanStack Query** for data fetching

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License