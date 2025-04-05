import { initProvider, getConnectedAddress } from '../utils/web3';

const WalletConnect = ({ setAddress }) => {
  const connectWallet = async () => {
    try {
      await initProvider();
      const address = await getConnectedAddress();
      setAddress(address);
    } catch (error) {
      alert(`Error connecting wallet: ${error.message}`);
    }
  };

  return (
    <button 
      onClick={connectWallet}
      className="connect-button"
    >
      Connect Wallet
    </button>
  );
};

export default WalletConnect;