import { BrowserProvider, Contract, ethers } from 'ethers';
import CustomNFT from '../contracts/CustomNFT.json';

let provider = null;
let nftContract = null;

// Fungsi untuk menginisialisasi provider
export const initProvider = async () => {
  if (window.ethereum) {
    try {
      provider = new BrowserProvider(window.ethereum);
      return provider;
    } catch (error) {
      console.error("Error initializing provider:", error);
      throw error;
    }
  }
  throw new Error("Please install MetaMask");
};

// Fungsi untuk mendapatkan alamat yang terhubung
export const getConnectedAddress = async () => {
  if (!provider) await initProvider();
  
  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    return accounts[0] || null;
  } catch (error) {
    console.error("Error getting connected address:", error);
    return null;
  }
};

// Fungsi untuk mendapatkan instance kontrak
export const getNFTContract = async () => {
  if (!provider) await initProvider();
  
  if (!nftContract) {
    try {
      const signer = await provider.getSigner();
      nftContract = new Contract(
        process.env.REACT_APP_CONTRACT_ADDRESS,
        CustomNFT.abi,
        signer
      );
      return nftContract;
    } catch (error) {
      console.error("Error getting contract:", error);
      throw error;
    }
  }
  return nftContract;
};

// Fungsi untuk mint NFT
export const mintNFT = async (name, description, imageURL) => {
  try {
    const contract = await getNFTContract();
    const tx = await contract.mintNFT(name, description, imageURL);
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error("Minting error:", error);
    throw error;
  }
};

// Fungsi untuk memeriksa jaringan yang terhubung
export const checkNetwork = async () => {
  if (!window.ethereum) return false;
  const chainId = await window.ethereum.request({ method: 'eth_chainId' });
  return parseInt(chainId, 16) === parseInt(process.env.REACT_APP_NETWORK_ID);
};