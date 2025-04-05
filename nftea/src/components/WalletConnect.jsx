import React from 'react';

const WalletConnect = ({ connectWallet }) => {
  return (
    <div className="max-w-md mx-auto bg-gray-800 rounded-xl shadow-md overflow-hidden p-6 text-center">
      <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
      <p className="text-gray-300 mb-6">
        To mint NFTs, please connect your Ethereum wallet.
      </p>
      <button
        onClick={connectWallet}
        className="bg-blue-600 hover:bg-blue-700 py-3 px-6 rounded-lg font-bold"
      >
        Connect Wallet
      </button>
      
      <div className="mt-6 text-sm text-gray-400">
        <p>We recommend using MetaMask or another Web3 wallet.</p>
      </div>
    </div>
  );
};

export default WalletConnect;