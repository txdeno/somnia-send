import React, { useState } from 'react';
import { useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { Recipient } from '../types';
import { getContractConfig } from '../config/contract';

interface TransactionPanelProps {
  recipients: Recipient[];
}

export const TransactionPanel: React.FC<TransactionPanelProps> = ({
  recipients,
}) => {
  const [isNative, setIsNative] = useState(true);
  const [tokenAddress, setTokenAddress] = useState('');
  const { address, isConnected } = useAccount();
  const [hash, setHash] = useState<string>('');
  const [isPending, setIsPending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const calculateTotal = () => {
    return recipients.reduce((sum, recipient) => {
      return sum + parseFloat(recipient.amount || '0');
    }, 0);
  };

  const handleDisperse = async () => {
    if (recipients.length === 0) {
      alert('Please add recipients');
      return;
    }

    if (!isConnected) {
      alert('Please connect your wallet');
      return;
    }

    try {
      const contractConfig = getContractConfig();
      setIsPending(true);

      // TODO: Implement contract interaction with proper Wagmi v2 API
      // For now, this is a placeholder
      console.log('Contract config:', contractConfig);
      console.log('Recipients:', recipients);
      console.log('Is native:', isNative);
      console.log('Token address:', tokenAddress);

      // Simulate transaction
      setTimeout(() => {
        setHash('0x' + Math.random().toString(16).substring(2, 66));
        setIsPending(false);
        alert('Transaction simulation complete. This is a demo - no actual transaction was sent.');
      }, 2000);

    } catch (error) {
      console.error('Transaction error:', error);
      alert('Transaction failed. Please check console for details.');
      setIsPending(false);
    }
  };

  const isValid = () => {
    try {
      const contractConfig = getContractConfig();
      return (
        contractConfig.address &&
        contractConfig.abi &&
        recipients.length > 0 &&
        recipients.every(r => r.address && r.amount) &&
        (isNative || tokenAddress)
      );
    } catch (error) {
      return false;
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Transaction Details</h3>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-2">
            Transaction Type
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                checked={isNative}
                onChange={() => setIsNative(true)}
                className="mr-2"
              />
              Native Token (SOMI)
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                checked={!isNative}
                onChange={() => setIsNative(false)}
                className="mr-2"
              />
              ERC20 Token
            </label>
          </div>
        </div>

        {!isNative && (
          <div>
            <label className="block text-sm font-medium mb-2">
              Token Contract Address
            </label>
            <input
              type="text"
              placeholder="0x..."
              className="w-full p-3 border rounded-lg"
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
            />
          </div>
        )}

        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex justify-between text-sm">
            <span>Recipients:</span>
            <span>{recipients.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Total Amount:</span>
            <span>{calculateTotal().toFixed(6)} {isNative ? 'SOMI' : 'tokens'}</span>
          </div>
        </div>

        {hash && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              Transaction Hash: {hash}
            </p>
            <a
              href={`https://mainnet.somnia.w3us.site/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              View on Explorer →
            </a>
          </div>
        )}

        <button
          onClick={handleDisperse}
          disabled={!isValid() || isPending || isConfirming}
          className={`w-full py-3 px-4 rounded-lg font-medium ${
            isValid() && !isPending && !isConfirming
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isPending || isConfirming
            ? 'Processing...'
            : `Disperse ${isNative ? 'SOMI' : 'Tokens'}`
          }
        </button>

        {!isConnected && (
          <p className="text-sm text-red-600 text-center">
            Please connect your wallet to continue
          </p>
        )}
      </div>
    </div>
  );
};