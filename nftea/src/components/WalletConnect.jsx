import React from "react";
import { NETWORK_CONFIG } from "../utils/constants";

const WalletConnect = ({ onConnect }) => {
  const switchToTeaSepolia = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: NETWORK_CONFIG.chainId }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [NETWORK_CONFIG],
          });
        } catch (addError) {
          console.error("Gagal menambahkan jaringan:", addError);
        }
      } else {
        console.error("Gagal mengganti jaringan:", switchError);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        await switchToTeaSepolia();

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-purple-100 p-4">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">NFTea Maker</h1>

      <button
        onClick={connectWallet}
        className="mb-4 bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-xl shadow-md transition duration-300"
      >
        Connect Wallet
      </button>

      <button
        onClick={switchToTeaSepolia}
        className="bg-white text-purple-600 border border-purple-500 hover:bg-purple-100 font-medium py-2 px-4 rounded-xl transition duration-300"
      >
        Switch to Tea Sepolia
      </button>
    </div>
  );
};

export default WalletConnect;
