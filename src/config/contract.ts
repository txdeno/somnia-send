// Define the ABI with proper TypeScript typing
const contractAbi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "token",
        "type": "address"
      }
    ],
    "name": "SafeERC20FailedOperation",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address[]",
        "name": "recipients",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "values",
        "type": "uint256[]"
      }
    ],
    "name": "disperseNative",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "contract IERC20",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "address[]",
        "name": "recipients",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "values",
        "type": "uint256[]"
      }
    ],
    "name": "disperseToken",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "contract IERC20",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "address[]",
        "name": "recipients",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "values",
        "type": "uint256[]"
      }
    ],
    "name": "disperseTokenSimple",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export const getContractConfig = () => {
  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

  if (!contractAddress) {
    throw new Error('REACT_APP_CONTRACT_ADDRESS is not set in environment variables');
  }

  return {
    address: contractAddress as `0x${string}`,
    abi: contractAbi,
  } as const;
};

export const getERC20ABI = () => {
  const erc20AbiString = process.env.REACT_APP_CONTRACT_ERC20_ABI;

  if (!erc20AbiString) {
    throw new Error('REACT_APP_CONTRACT_ERC20_ABI is not set in environment variables');
  }

  try {
    return JSON.parse(erc20AbiString);
  } catch (error) {
    throw new Error('Invalid ERC20 ABI format in environment variables');
  }
};