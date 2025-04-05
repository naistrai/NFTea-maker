import { BrowserProvider, Contract, ethers } from 'ethers';
import NFTea from '../contracts/NFTea.json';

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
        NFTea.abi,
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
    return tx;
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

// Fungsi untuk mengupload gambar
export const uploadImageToImgHippo = async (file) => {
  const apiKey = process.env.REACT_APP_IMGHIPPO_API; // Ganti dengan API key Anda
  const formData = new FormData();
  formData.append('api_key', apiKey);
  formData.append('file', file);

  try {
    const response = await fetch('https://api.imghippo.com/v1/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (data.success) {
      return data.data.url; // URL gambar yang diunggah
    } else {
      throw new Error(data.error.message || 'Failed to upload image');
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};