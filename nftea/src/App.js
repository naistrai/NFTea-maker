import { useState, useEffect } from 'react';
import { initProvider, onAccountsChanged } from './utils/web3';
import MintForm from './components/MintForm';
import WalletConnect from './components/WalletConnect';
import NFTGallery from './components/NFTGallery';

function App() {
  const [address, setAddress] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        await initProvider();
        const addr = await getConnectedAddress();
        setAddress(addr);
      } catch (error) {
        console.log("Initialization error:", error);
      }
    };

    init();

    onAccountsChanged((newAddress) => {
      setAddress(newAddress);
    });
  }, []);

  return (
    <div className="App">
      {address ? (
        <>
          <MintForm refreshNFTs={() => {}} />
          <NFTGallery address={address} />
        </>
      ) : (
        <WalletConnect setAddress={setAddress} />
      )}
    </div>
  );
}

export default App;