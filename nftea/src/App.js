import { useState, useEffect } from 'react';
import { initProvider, getConnectedAddress, setupEventListeners } from './utils/web3';
import MintForm from './components/MintForm';
import WalletConnect from './components/WalletConnect';

function App() {
  const [address, setAddress] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        await initProvider();
        const addr = await getConnectedAddress();
        setAddress(addr);
        
        // Setup event listeners
        setupEventListeners((newAddress) => {
          setAddress(newAddress);
        });
      } catch (error) {
        console.error("Initialization error:", error);
      }
    };

    init();

    return () => {
      // Cleanup listeners
      removeEventListeners();
    };
  }, []);

  return (
    <div className="App">
      {address ? (
        <MintForm />
      ) : (
        <WalletConnect setAddress={setAddress} />
      )}
    </div>
  );
}

export default App;