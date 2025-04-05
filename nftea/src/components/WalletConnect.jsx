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
    <button
      onClick={connectWallet}
      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
    >
      Connect Wallet
    </button>
  );
};

export default WalletConnect;
