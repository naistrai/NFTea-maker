import { ethers } from 'ethers';
import CustomNFT from '../contracts/CustomNFT.json';
import { 
  CONTRACT_ADDRESS,
  NETWORK_CONFIG,
  NETWORK_ID,
  NETWORK_NAME
} from './constants';

let provider = null;
let nftContract = null;
let signer = null;

export const initProvider = async () => {
  if (window.ethereum) {
    try {
      provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      return provider;
    } catch (error) {
      console.error("Error initializing provider:", error);
      throw new Error("Failed to connect wallet");
    }
  } else {
    throw new Error("Please install MetaMask or another Web3 wallet");
  }
};

export const getNFTContract = async () => {
  if (nftContract) return nftContract;

  if (!provider) {
    await initProvider();
  }

  signer = provider.getSigner();
  nftContract = new ethers.Contract(
    CONTRACT_ADDRESS,
    CustomNFT.abi,
    signer
  );

  return nftContract;
};

export const checkCorrectNetwork = async () => {
  if (!window.ethereum) return false;
  const chainId = await window.ethereum.request({ method: 'eth_chainId' });
  return parseInt(chainId, 16) === NETWORK_ID;
};

export const switchToCorrectNetwork = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: NETWORK_CONFIG.chainId }],
    });
  } catch (switchError) {
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [NETWORK_CONFIG],
        });
      } catch (addError) {
        throw new Error(`Failed to add Tea Sepolia network: ${addError.message}`);
      }
    } else {
      throw new Error(`Failed to switch to Tea Sepolia: ${switchError.message}`);
    }
  }
};

// ... (fungsi lainnya tetap sama seperti sebelumnya)

// Fungsi khusus untuk Tea Sepolia
export const requestTestnetTEA = async () => {
  if (!window.ethereum) return null;
  
  const address = await getConnectedAddress();
  if (!address) return null;
  
  try {
    const response = await fetch("https://faucet-sepolia.tea.xyz/api/v1/faucet", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address: address,
        chainId: NETWORK_ID,
      }),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error requesting TEA tokens:", error);
    throw error;
  }
};

export default {
  initProvider,
  getNFTContract,
  checkCorrectNetwork,
  switchToCorrectNetwork,
  getConnectedAddress,
  getETHBalance: async (address) => {
    if (!provider) await initProvider();
    const balance = await provider.getBalance(address);
    return ethers.utils.formatEther(balance) + " " + CURRENCY_SYMBOL;
  },
  onAccountsChanged,
  onChainChanged,
  cleanupListeners,
  estimateMintGas,
  formatGasPrice,
  requestTestnetTEA // Tambahkan fungsi faucet ke export
};