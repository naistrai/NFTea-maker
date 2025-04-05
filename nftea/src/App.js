import { useState, useEffect } from 'react';
import { initProvider, getConnectedAddress, checkNetwork } from './utils/web3';
import MintForm from './components/MintForm';
import WalletConnect from './components/WalletConnect';
import './App.css';

function App() {
  const [account, setAccount] = useState(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        await initProvider();
        const address = await getConnectedAddress();
        if (address) {
          setAccount(address);
          const networkCorrect = await checkNetwork();
          setIsCorrectNetwork(networkCorrect);
        }
      } catch (error) {
        console.log("Initial connection check error:", error);
      }
    };

    checkConnection();
  }, []);

  const handleConnect = (address) => {
    setAccount(address);
  };

  return (
    <div className="app-container">
      {!isCorrectNetwork && (
        <div className="network-warning">
          Please connect to Tea Sepolia network
        </div>
      )}
      
      {account ? (
        // <MintForm />
        <MintForm 
          onMintSuccess={(txHash) => {
            console.log("Minting success! TX:", txHash);
            // Tambahkan logic redirect/notifikasi di sini
          }}
        />
      ) : (
        <WalletConnect onConnect={handleConnect} />
      )}
    </div>
  );
}

export default App;