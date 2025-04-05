import React, { useEffect, useState } from "react";
import { NETWORK_CONFIG } from "../utils/constants";

const WalletConnect = ({ onConnect }) => {
  const [currentChainId, setCurrentChainId] = useState(null);

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

        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        });
        setCurrentChainId(chainId);

        if (chainId !== NETWORK_CONFIG.chainId) return;

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

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: "eth_chainId" }).then(setCurrentChainId);
      window.ethereum.on("chainChanged", (chainId) => {
        setCurrentChainId(chainId);
        window.location.reload();
      });
    }
  }, []);

  const isCorrectNetwork = currentChainId === NETWORK_CONFIG.chainId;

  const buttonStyle =
    "inline-block px-6 py-3 rounded-xl font-semibold shadow-md transition duration-300";

  const primaryStyle =
    "bg-purple-600 text-white hover:bg-purple-700";

  const dangerStyle =
    "bg-red-600 text-white hover:bg-red-700";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-purple-100 p-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">NFTea Maker</h1>

      {!isCorrectNetwork ? (
        <div className="bg-white border border-red-300 text-red-700 p-6 rounded-xl shadow max-w-sm text-center">
          <p className="mb-4 text-lg font-medium">
            Please connect to the <span className="font-bold">Tea Sepolia</span> network.
          </p>
          <button
            onClick={switchToTeaSepolia}
            className={`${buttonStyle} ${dangerStyle}`}
          >
            Switch Network
          </button>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          className={`${buttonStyle} ${primaryStyle}`}
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
};

export default WalletConnect;
