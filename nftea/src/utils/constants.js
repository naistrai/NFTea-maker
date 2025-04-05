// Jaringan Tea Sepolia
export const CURRENCY_SYMBOL = "TEA";
export const FAUCET_URL = "https://faucet-sepolia.tea.xyz/";

export const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;
export const NETWORK_ID = parseInt(process.env.REACT_APP_NETWORK_ID || "10218");
export const NETWORK_NAME = "Tea Sepolia";
export const DEFAULT_RPC_URL = "https://tea-sepolia.g.alchemy.com/public";
export const BLOCK_EXPLORER_URL = "https://sepolia.tea.xyz";

// Konfigurasi untuk Add Network
export const NETWORK_CONFIG = {
  // chainId: `0x${NETWORK_ID.toString(16)}`,
  chainId: '0x27a0', // 0x27a0 = 10218
  chainName: NETWORK_NAME,
  nativeCurrency: {
    name: "Tea",
    symbol: CURRENCY_SYMBOL,
    decimals: 18,
  },
  rpcUrls: [DEFAULT_RPC_URL],
  blockExplorerUrls: [BLOCK_EXPLORER_URL],
};