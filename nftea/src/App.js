import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Navbar from './components/Navbar';
import MintForm from './components/MintForm';
import WalletConnect from './components/WalletConnect';
import Notification from './components/Notification';
import NFTGallery from './components/NFTGallery';
import Loader from './components/Loader';
import CustomNFT from './contracts/CustomNFT.json';
import { CONTRACT_ADDRESS, NETWORK_ID, NETWORK_NAME } from './utils/constants';
import { checkNetwork, parseNFTData } from './utils/helpers';

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [nfts, setNfts] = useState([]);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);

  const showNotification = (message, isError = false) => {
    setNotification({ message, isError });
    setTimeout(() => setNotification(null), 5000);
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        setLoading(true);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        
        // Verifikasi jaringan
        const isCorrectNetwork = await checkNetwork(NETWORK_ID);
        if (!isCorrectNetwork) {
          throw new Error(`Please connect to ${NETWORK_NAME}`);
        }

        const signer = provider.getSigner();
        const address = await signer.getAddress();
        
        const nftContract = new ethers.Contract(
          CONTRACT_ADDRESS, 
          CustomNFT.abi, 
          signer
        );

        setProvider(provider);
        setAccount(address);
        setContract(nftContract);
        showNotification("Wallet connected successfully!");
        
        // Ambil NFT pengguna
        await fetchNFTs(nftContract, address);
      } catch (err) {
        showNotification(err.message, true);
      } finally {
        setLoading(false);
      }
    } else {
      showNotification("Please install MetaMask!", true);
    }
  };

  const fetchNFTs = async (contract, owner) => {
    try {
      setLoading(true);
      const balance = await contract.balanceOf(owner);
      const nftsArray = [];
      
      for (let i = 0; i < balance.toNumber(); i++) {
        const tokenId = await contract.tokenOfOwnerByIndex(owner, i);
        const tokenURI = await contract.tokenURI(tokenId);
        const metadata = parseNFTData(tokenURI);
        nftsArray.push({ tokenId, metadata });
      }
      
      setNfts(nftsArray);
    } catch (err) {
      showNotification("Error fetching NFTs: " + err.message, true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          const signer = provider.getSigner();
          const nftContract = new ethers.Contract(
            CONTRACT_ADDRESS, 
            CustomNFT.abi, 
            signer
          );
          
          setProvider(provider);
          setAccount(accounts[0]);
          setContract(nftContract);
          await fetchNFTs(nftContract, accounts[0]);
        }
      }
    };

    checkWalletConnection();

    // Event listeners
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          // Wallet disconnected
          setAccount(null);
          setContract(null);
          setNfts([]);
        } else {
          window.location.reload();
        }
      });
      
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <Navbar account={account} />
      
      <main className="container mx-auto px-4 py-8">
        {loading && <Loader />}
        
        {!account ? (
          <WalletConnect connectWallet={connectWallet} />
        ) : (
          <>
            <MintForm 
              contract={contract} 
              showNotification={showNotification}
              refreshNFTs={() => fetchNFTs(contract, account)}
            />
            <NFTGallery nfts={nfts} />
          </>
        )}
      </main>

      {notification && (
        <Notification 
          message={notification.message} 
          isError={notification.isError} 
        />
      )}
    </div>
  );
}

export default App;