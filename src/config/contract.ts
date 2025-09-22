export const getContractConfig = () => {
  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
  const contractAbiString = process.env.REACT_APP_CONTRACT_ABI;

  if (!contractAddress) {
    throw new Error('REACT_APP_CONTRACT_ADDRESS is not set in environment variables');
  }

  if (!contractAbiString) {
    throw new Error('REACT_APP_CONTRACT_ABI is not set in environment variables');
  }

  let contractAbi;
  try {
    contractAbi = JSON.parse(contractAbiString);
  } catch (error) {
    throw new Error('REACT_APP_CONTRACT_ABI is not valid JSON');
  }

  return {
    address: contractAddress,
    abi: contractAbi,
  };
};