import { initProvider, getConnectedAddress } from '../utils/web3';

const WalletConnect = ({ setAddress }) => {
  const connect = async () => {
    try {
      await initProvider();
      const address = await getConnectedAddress();
      setAddress(address);
    } catch (error) {
      console.error("Connection error:", error);
    }
  };

  return (
    <div className="wallet-connect">
      <button onClick={connect}>Connect Wallet</button>
    </div>
  );
};

export default WalletConnect;