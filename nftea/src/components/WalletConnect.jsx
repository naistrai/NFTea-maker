// src/components/WalletConnect.js
import React from "react";

const WalletConnect = ({ onConnect }) => {
  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        if (accounts.length > 0) {
          onConnect(accounts[0]);
        }
      } catch (error) {
        console.error("User rejected wallet connection:", error);
      }
    } else {
      alert("MetaMask tidak ditemukan. Silakan install MetaMask terlebih dahulu.");
    }
  };

  return (
    <button
      onClick={connectWallet}
      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
    >
      Connect Wallet
    </button>
  );
};

export default WalletConnect;
