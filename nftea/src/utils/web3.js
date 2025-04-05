import { BrowserProvider, Contract, ethers } from 'ethers';
import CustomNFT from '../contracts/CustomNFT.json';

import { 
  CONTRACT_ADDRESS,
  NETWORK_ID,
  NETWORK_NAME,
  DEFAULT_RPC_URL
} from './constants';

let provider = null;
let nftContract = null;

export const initProvider = async () => {
  if (window.ethereum) {
    try {
      provider = new BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      return provider;
    } catch (error) {
      console.error("Error initializing provider:", error);
      throw new Error("Failed to connect wallet");
    }
  } else {
    provider = new ethers.JsonRpcProvider(DEFAULT_RPC_URL);
    return provider;
  }
};

export const getNFTContract = async () => {
  if (!nftContract) {
    if (!provider) await initProvider();
    const signer = await provider.getSigner();
    nftContract = new Contract(
      CONTRACT_ADDRESS,
      CustomNFT.abi,
      signer
    );
  }
  return nftContract;
};

export const checkCorrectNetwork = async () => {
  if (!window.ethereum) return false;
  const chainId = await window.ethereum.request({ method: 'eth_chainId' });
  return parseInt(chainId, 16) === NETWORK_ID;
};

export const getConnectedAddress = async () => {
  if (!provider) await initProvider();
  if (window.ethereum) {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    return accounts[0] || null;
  }
  return null;
};

export const formatBalance = (balance) => {
  return parseFloat(ethers.formatEther(balance)).toFixed(4);
};

// Tambahkan fungsi-fungsi ini:
export const setupEventListeners = (callback) => {
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
      callback(accounts[0] || null);
    });
    
    window.ethereum.on('chainChanged', () => {
      window.location.reload();
    });
  }
};

export const removeEventListeners = () => {
  if (window.ethereum) {
    window.ethereum.removeAllListeners('accountsChanged');
    window.ethereum.removeAllListeners('chainChanged');
  }
};

// Ganti nama export untuk konsistensi
export const onAccountsChanged = setupEventListeners;