// Jaringan Tea Sepolia
export const CONTRACT_ADDRESS = "0xE6b48ad5f18F17C309EC3c1f75933aB30b3c6A1F"; // Ganti dengan alamat kontrak Anda di Tea Sepolia
export const NETWORK_ID = 10218;
export const NETWORK_NAME = "Tea Sepolia";
export const DEFAULT_RPC_URL = "https://tea-sepolia.g.alchemy.com/public";
export const BLOCK_EXPLORER_URL = "https://sepolia.tea.xyz";
export const CURRENCY_SYMBOL = "TEA";
export const FAUCET_URL = "https://faucet-sepolia.tea.xyz/";

// Konfigurasi untuk Add Network
export const NETWORK_CONFIG = {
  chainId: `0x${NETWORK_ID.toString(16)}`,
  chainName: NETWORK_NAME,
  nativeCurrency: {
    name: "Tea",
    symbol: CURRENCY_SYMBOL,
    decimals: 18,
  },
  rpcUrls: [DEFAULT_RPC_URL],
  blockExplorerUrls: [BLOCK_EXPLORER_URL],
};