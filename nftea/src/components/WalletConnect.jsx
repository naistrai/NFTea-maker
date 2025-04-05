import { initProvider, getConnectedAddress } from '../utils/web3';

const WalletConnect = ({ onConnect }) => {
  const handleConnect = async () => {
    try {
      await initProvider();
      const address = await getConnectedAddress();
      onConnect(address);
    } catch (error) {
      console.error("Wallet connection error:", error);
      alert(`Error connecting wallet: ${error.message}`);
    }
  };

  return (
    <button onClick={handleConnect} className="connect-button">
      Connect Wallet
    </button>
  );
};

export default WalletConnect;