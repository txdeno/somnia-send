import React, { useState } from 'react';
import { useAccount, useWaitForTransactionReceipt, useWriteContract, useBalance } from 'wagmi';
import { parseEther, formatEther } from 'viem';
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
  const [error, setError] = useState<string>('');

  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { writeContract, data: hash, isPending, error: contractError, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, isError } = useWaitForTransactionReceipt({
    hash,
  });

  const calculateTotal = () => {
    return recipients.reduce((sum, recipient) => {
      return sum + parseFloat(recipient.amount || '0');
    }, 0);
  };

  const handleDisperse = () => {
    setError('');
    reset();

    if (recipients.length === 0) {
      setError('Please add recipients');
      return;
    }

    if (!isConnected) {
      setError('Please connect your wallet');
      return;
    }

    // Validate recipient addresses and amounts
    for (const recipient of recipients) {
      if (!recipient.address || !recipient.amount) {
        setError('All recipients must have valid addresses and amounts');
        return;
      }

      if (isNaN(parseFloat(recipient.amount)) || parseFloat(recipient.amount) <= 0) {
        setError('All amounts must be valid positive numbers');
        return;
      }

      // Basic address validation
      if (!/^0x[a-fA-F0-9]{40}$/.test(recipient.address)) {
        setError(`Invalid address format: ${recipient.address}`);
        return;
      }
    }

    if (!isNative && (!tokenAddress || !/^0x[a-fA-F0-9]{40}$/.test(tokenAddress))) {
      setError('Please provide a valid token contract address');
      return;
    }

    try {
      const contractConfig = getContractConfig();
      const addresses = recipients.map(r => r.address);
      const amounts = recipients.map(r => parseEther(r.amount));

      if (isNative) {
        // Check if user has enough balance for native token transfer
        const totalValue = amounts.reduce((sum, amount) => sum + amount, BigInt(0));

        if (balance && balance.value < totalValue) {
          setError(`Insufficient balance. Required: ${formatEther(totalValue)} SOMI, Available: ${formatEther(balance.value)} SOMI`);
          return;
        }

        // Call disperseNative function
        (writeContract as any)({
          address: contractConfig.address as `0x${string}`,
          abi: contractConfig.abi,
          functionName: 'disperseNative',
          args: [addresses, amounts],
          value: totalValue,
        });
      } else {
        // Call disperseToken function
        (writeContract as any)({
          address: contractConfig.address as `0x${string}`,
          abi: contractConfig.abi,
          functionName: 'disperseToken',
          args: [tokenAddress as `0x${string}`, addresses, amounts],
        });
      }
    } catch (error: any) {
      console.error('Transaction error:', error);
      setError(error.message || 'Transaction failed. Please try again.');
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
          {balance && isNative && (
            <div className="flex justify-between text-sm">
              <span>Wallet Balance:</span>
              <span>{parseFloat(formatEther(balance.value)).toFixed(6)} SOMI</span>
            </div>
          )}
        </div>

        {/* Error Display */}
        {(error || contractError) && (
          <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
            <p className="text-sm text-red-800">
              {error || contractError?.message || 'Transaction failed'}
            </p>
          </div>
        )}

        {/* Transaction Status */}
        {hash && (
          <div className={`p-3 rounded-lg ${
            isSuccess ? 'bg-green-50 border border-green-200' :
            isError ? 'bg-red-50 border border-red-200' :
            'bg-blue-50 border border-blue-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {isConfirming && (
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              )}
              {isError && (
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
              <p className={`text-sm font-medium ${
                isSuccess ? 'text-green-800' :
                isError ? 'text-red-800' :
                'text-blue-800'
              }`}>
                {isConfirming ? 'Confirming Transaction...' :
                 isSuccess ? 'Transaction Successful!' :
                 isError ? 'Transaction Failed' :
                 'Transaction Submitted'}
              </p>
            </div>
            <p className="text-xs text-gray-600 mb-2">
              Hash: {hash}
            </p>
            <a
              href={`https://explorer.somnia.network/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              View on Somnia Explorer →
            </a>
          </div>
        )}

        <button
          onClick={handleDisperse}
          disabled={!isValid() || isPending || isConfirming}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            isValid() && !isPending && !isConfirming
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isPending
            ? 'Waiting for signature...'
            : isConfirming
            ? 'Confirming transaction...'
            : `Disperse ${isNative ? 'SOMI' : 'Tokens'}`
          }
        </button>

        {!isConnected && (
          <p className="text-sm text-red-600 text-center">
            Please connect your wallet to continue
          </p>
        )}

        {isSuccess && (
          <div className="text-center">
            <button
              onClick={() => {
                reset();
                setError('');
              }}
              className="text-blue-500 hover:text-blue-700 text-sm"
            >
              Send Another Transaction
            </button>
          </div>
        )}
      </div>
    </div>
  );
};