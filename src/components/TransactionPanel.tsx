import React, { useState, useEffect } from 'react';
import { useAccount, useWaitForTransactionReceipt, useWriteContract, useBalance, useReadContract } from 'wagmi';
import { parseEther, formatEther, parseUnits } from 'viem';
import { Recipient } from '../types';
import { getContractConfig, getERC20ABI } from '../config/contract';

interface TransactionPanelProps {
  recipients: Recipient[];
}

export const TransactionPanel: React.FC<TransactionPanelProps> = ({
  recipients,
}) => {
  const [isNative, setIsNative] = useState(true);
  const [tokenAddress, setTokenAddress] = useState('');
  const [error, setError] = useState<string>('');
  const [tokenDecimals, setTokenDecimals] = useState(18);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [approvedToken, setApprovedToken] = useState<string>('');

  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { writeContract, data: hash, isPending, error: contractError, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, isError } = useWaitForTransactionReceipt({
    hash,
  });

  // Get ERC20 ABI from environment variables
  const getERC20AbiConfig = () => {
    try {
      const config = getERC20ABI();
      return config.abi;
    } catch {
      return [];
    }
  };

  // Check allowance for ERC20 tokens
  const contractConfig = (() => {
    try {
      return getContractConfig();
    } catch {
      return { address: '', abi: [] };
    }
  })();

  // Read ERC20 token decimals - conditionally enabled
  const shouldFetchTokenData = !isNative && !!tokenAddress && /^0x[a-fA-F0-9]{40}$/.test(tokenAddress) && !!address;

  const { data: decimalsData } = useReadContract(
    shouldFetchTokenData ? {
      address: tokenAddress as `0x${string}`,
      abi: getERC20AbiConfig(),
      functionName: 'decimals',
    } : undefined
  );

  // Read ERC20 token balance for current user
  const { data: tokenBalanceData, refetch: refetchBalance } = useReadContract(
    shouldFetchTokenData ? {
      address: tokenAddress as `0x${string}`,
      abi: getERC20AbiConfig(),
      functionName: 'balanceOf',
      args: [address],
    } : undefined
  );

  // Read ERC20 token allowance for the contract
  const { data: allowanceData, refetch: refetchAllowance } = useReadContract(
    shouldFetchTokenData ? {
      address: tokenAddress as `0x${string}`,
      abi: getERC20AbiConfig(),
      functionName: 'allowance',
      args: [address, contractConfig.address],
    } : undefined
  );

  // Simplified approach - assume approval is needed for ERC20 tokens
  // In a future version, we can add proper allowance checking

  // Set token decimals from contract or default to 18
  useEffect(() => {
    if (!isNative && decimalsData !== undefined) {
      setTokenDecimals(decimalsData as number);
    } else {
      setTokenDecimals(18);
    }
  }, [isNative, decimalsData]);

  const calculateTotal = () => {
    return recipients.reduce((sum, recipient) => {
      return sum + parseFloat(recipient.amount || '0');
    }, 0);
  };

  const getTotalAmountInWei = () => {
    const total = calculateTotal();
    return isNative ? parseEther(total.toString()) : parseUnits(total.toString(), tokenDecimals);
  };

  // Helper function to format token amounts with proper decimals
  const formatTokenAmount = (amount: bigint, decimals?: number) => {
    const actualDecimals = decimals || tokenDecimals || 18;
    const divisor = BigInt(10 ** actualDecimals);
    const wholePart = amount / divisor;
    const fractionalPart = amount % divisor;

    // Convert fractional part to decimal representation
    const fractionalStr = fractionalPart.toString().padStart(actualDecimals, '0');
    const trimmedFractional = fractionalStr.replace(/0+$/, '');

    if (trimmedFractional === '') {
      return wholePart.toString();
    } else {
      return `${wholePart}.${trimmedFractional}`;
    }
  };

  // Clear approved token when token address changes
  useEffect(() => {
    if (tokenAddress !== approvedToken) {
      setApprovedToken('');
    }
  }, [tokenAddress, approvedToken]);

  // Check if approval is needed for ERC20 tokens based on actual allowance
  useEffect(() => {
    if (!isNative && recipients.length > 0 && tokenAddress) {
      // Check if this token has already been approved recently
      if (approvedToken === tokenAddress) {
        setNeedsApproval(false);
      } else if (allowanceData !== undefined) {
        const totalRequired = getTotalAmountInWei();
        const currentAllowance = allowanceData as bigint;
        setNeedsApproval(currentAllowance < totalRequired);
      } else {
        // If allowance is still loading, assume approval is needed
        setNeedsApproval(true);
      }
    } else {
      setNeedsApproval(false);
    }
  }, [recipients, isNative, tokenAddress, allowanceData, approvedToken]);

  // Auto-refresh approval status after successful approval transaction
  useEffect(() => {
    if (isSuccess && hash && !isNative && tokenAddress) {
      // If approval was successful, mark this token as approved after a short delay
      const timer = setTimeout(() => {
        setApprovedToken(tokenAddress);
        setNeedsApproval(false);
        setError(''); // Clear any errors
        refetchAllowance(); // Also refetch for future enhancements
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isSuccess, hash, isNative, tokenAddress, refetchAllowance]);

  const handleApprove = () => {
    setError('');
    reset();

    if (!tokenAddress || !contractConfig.address) {
      setError('Missing token address or contract configuration');
      return;
    }

    try {
      const totalRequired = getTotalAmountInWei();

      (writeContract as any)({
        address: tokenAddress as `0x${string}`,
        abi: getERC20AbiConfig(),
        functionName: 'approve',
        args: [contractConfig.address, totalRequired],
        gas: BigInt(100000),
      });
    } catch (error: any) {
      console.error('Approval error:', error);
      setError(error.message || 'Approval failed. Please try again.');
    }
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
      const addresses = recipients.map(r => r.address);
      const amounts = recipients.map(r =>
        isNative ? parseEther(r.amount) : parseUnits(r.amount, tokenDecimals)
      );

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
          gas: BigInt(300000), // Gas limit for native token dispersal
        });
      } else {
        // Check if approval is sufficient for ERC20 tokens
        if (needsApproval) {
          setError('Please approve the token spending first');
          return;
        }

        // Check ERC20 token balance
        const totalTokensRequired = amounts.reduce((sum, amount) => sum + amount, BigInt(0));
        if (tokenBalanceData !== undefined) {
          const currentBalance = tokenBalanceData as bigint;
          if (currentBalance < totalTokensRequired) {
            const actualDecimals = decimalsData ? Number(decimalsData) : tokenDecimals;
            setError(`Insufficient token balance. Required: ${formatTokenAmount(totalTokensRequired, actualDecimals)} tokens, Available: ${formatTokenAmount(currentBalance, actualDecimals)} tokens`);
            return;
          }
        }

        // Call disperseToken function
        (writeContract as any)({
          address: contractConfig.address as `0x${string}`,
          abi: contractConfig.abi,
          functionName: 'disperseToken',
          args: [tokenAddress as `0x${string}`, addresses, amounts],
          gas: BigInt(500000), // Higher gas limit for token dispersal
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
            <span>{calculateTotal()} {isNative ? 'SOMI' : 'tokens'}</span>
          </div>
          {balance && isNative && (
            <div className="flex justify-between text-sm">
              <span>Wallet Balance:</span>
              <span>{formatTokenAmount(balance.value, 18)} SOMI</span>
            </div>
          )}
          {!isNative && (
            <div className="flex justify-between text-sm">
              <span>Status:</span>
              <span>{needsApproval ? 'Approval Required' : 'Ready to Send'}</span>
            </div>
          )}
          {!isNative && (
            <div className="flex justify-between text-sm">
              <span>Required Amount:</span>
              <span className="font-mono text-xs">{calculateTotal()} tokens</span>
            </div>
          )}
          {!isNative && tokenBalanceData !== undefined && (
            <div className="flex justify-between text-sm">
              <span>Token Balance:</span>
              <span className="font-mono text-xs">
                {formatTokenAmount(tokenBalanceData as bigint, decimalsData ? Number(decimalsData) : undefined)} tokens
              </span>
            </div>
          )}
          {!isNative && needsApproval && (
            <div className="text-xs text-yellow-700 mt-1">
              ⚠️ Token approval required before sending
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

        {/* Approval section for ERC20 tokens */}
        {!isNative && needsApproval && (
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-4">
            <p className="text-sm text-yellow-800 mb-2">
              📋 Token approval required before sending
            </p>
            <p className="text-xs text-yellow-700 mb-3">
              You need to approve the multisender contract to spend your tokens first.
            </p>
            <button
              onClick={handleApprove}
              disabled={isPending || isConfirming}
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                !isPending && !isConfirming
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isPending
                ? 'Waiting for signature...'
                : isConfirming
                ? 'Confirming approval...'
                : 'Approve Token Spending'
              }
            </button>
          </div>
        )}

        <button
          onClick={handleDisperse}
          disabled={!isValid() || isPending || isConfirming || (!isNative && needsApproval)}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            isValid() && !isPending && !isConfirming && (isNative || !needsApproval)
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isPending
            ? 'Waiting for signature...'
            : isConfirming
            ? 'Confirming transaction...'
            : !isNative && needsApproval
            ? 'Approve tokens first'
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