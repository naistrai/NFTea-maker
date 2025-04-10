"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { ethers } from "ethers"
import { useToast } from "@/hooks/use-toast"

// Contract ABI and address
const CONTRACT_ADDRESS = "0x3d3798aC5827718850008bc2A33C51D1033aa956"
const CONTRACT_ABI = [
  // mintNFT function
  {
    inputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "description",
        type: "string",
      },
      {
        internalType: "string",
        name: "imageURL",
        type: "string",
      },
    ],
    name: "mintNFT",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // balanceOf function (ERC721 standard)
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  // ownerOf function (ERC721 standard)
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "ownerOf",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  // tokenIdToData function
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "tokenIdToData",
    outputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "description",
        type: "string",
      },
      {
        internalType: "string",
        name: "imageURL",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  // Additional standard ERC721 functions that might be needed
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "tokenURI",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
]

// Tea Sepolia chain ID and configuration
// Chain ID 10218 in hex is 0x27ea
const TEA_SEPOLIA_CHAIN_ID = "0x27ea"
const TEA_SEPOLIA_CONFIG = {
  chainId: TEA_SEPOLIA_CHAIN_ID,
  chainName: "Tea Sepolia",
  nativeCurrency: {
    name: "TEA",
    symbol: "TEA",
    decimals: 18,
  },
  rpcUrls: ["https://tea-sepolia.g.alchemy.com/public"],
  blockExplorerUrls: ["https://sepolia.tea.xyz/"],
}

interface WalletContextType {
  account: string | null
  balance: string
  chainId: string | null
  isCorrectNetwork: boolean
  isConnecting: boolean
  provider: ethers.BrowserProvider | null
  contract: ethers.Contract | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  switchNetwork: () => Promise<void>
}

const WalletContext = createContext<WalletContextType>({
  account: null,
  balance: "0",
  chainId: null,
  isCorrectNetwork: false,
  isConnecting: false,
  provider: null,
  contract: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  switchNetwork: async () => {},
})

export function WalletProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast()
  const [account, setAccount] = useState<string | null>(null)
  const [balance, setBalance] = useState<string>("0")
  const [chainId, setChainId] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [contract, setContract] = useState<ethers.Contract | null>(null)

  const isCorrectNetwork = chainId === TEA_SEPOLIA_CHAIN_ID

  // Initialize provider and contract
  useEffect(() => {
    const initProvider = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          // Check if already connected
          const web3Provider = new ethers.BrowserProvider(window.ethereum)
          const accounts = await web3Provider.listAccounts()

          if (accounts.length > 0) {
            const signer = await web3Provider.getSigner()
            const address = await signer.getAddress()
            const network = await web3Provider.getNetwork()
            const chainId = "0x" + network.chainId.toString(16)
            const balanceWei = await web3Provider.getBalance(address)
            const balanceEth = ethers.formatEther(balanceWei)
            const formattedBalance = Number.parseFloat(balanceEth).toFixed(4)

            setAccount(address)
            setChainId(chainId)
            setBalance(formattedBalance)
            setProvider(web3Provider)

            // Initialize contract
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
            setContract(contract)
          }
        } catch (error) {
          console.error("Error initializing provider:", error)
        }
      }
    }

    initProvider()

    // Setup event listeners
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)
    }

    return () => {
      if (typeof window !== "undefined" && window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [])

  // Update balance when account or chainId changes
  useEffect(() => {
    const updateBalance = async () => {
      if (account && provider) {
        try {
          const balanceWei = await provider.getBalance(account)
          const balanceEth = ethers.formatEther(balanceWei)
          const formattedBalance = Number.parseFloat(balanceEth).toFixed(4)
          setBalance(formattedBalance)
        } catch (error) {
          console.error("Error updating balance:", error)
        }
      }
    }

    updateBalance()
  }, [account, provider, chainId])

  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected their wallet
      disconnectWallet()
    } else {
      // Account changed
      const newAccount = accounts[0]
      setAccount(newAccount)

      // Update contract with new signer if provider exists
      if (provider) {
        try {
          const signer = await provider.getSigner()
          const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
          setContract(contract)
        } catch (error) {
          console.error("Error updating contract signer:", error)
        }
      }
    }
  }

  const handleChainChanged = (chainId: string) => {
    // Reload the page when chain changes
    window.location.reload()
  }

  const connectWallet = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      toast({
        title: "MetaMask not found",
        description: "Please install MetaMask to use this app",
        variant: "destructive",
      })
      return
    }

    try {
      setIsConnecting(true)

      // Request account access
      const web3Provider = new ethers.BrowserProvider(window.ethereum)
      await window.ethereum.request({ method: "eth_requestAccounts" })

      const signer = await web3Provider.getSigner()
      const address = await signer.getAddress()
      const network = await web3Provider.getNetwork()
      const chainId = "0x" + network.chainId.toString(16)
      const balanceWei = await web3Provider.getBalance(address)
      const balanceEth = ethers.formatEther(balanceWei)
      const formattedBalance = Number.parseFloat(balanceEth).toFixed(4)

      setAccount(address)
      setChainId(chainId)
      setBalance(formattedBalance)
      setProvider(web3Provider)

      // Initialize contract
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
      setContract(contract)

      toast({
        title: "Wallet connected",
        description: "Your wallet has been connected successfully",
      })

      // Check if on correct network
      if (chainId !== TEA_SEPOLIA_CHAIN_ID) {
        toast({
          title: "Wrong Network",
          description: "Please switch to Tea Sepolia network",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error connecting wallet:", error)
      toast({
        title: "Connection failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
    setBalance("0")
    setChainId(null)
    setProvider(null)
    setContract(null)

    toast({
      title: "Wallet disconnected",
      description: "Your wallet has been disconnected",
    })
  }

  const switchNetwork = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      toast({
        title: "MetaMask not found",
        description: "Please install MetaMask to use this app",
        variant: "destructive",
      })
      return
    }

    try {
      // Try to switch to Tea Sepolia
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: TEA_SEPOLIA_CHAIN_ID }],
      })

      toast({
        title: "Network switched",
        description: "Successfully switched to Tea Sepolia network",
      })
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [TEA_SEPOLIA_CONFIG],
          })

          toast({
            title: "Network added",
            description: "Tea Sepolia network has been added to your wallet",
          })
        } catch (addError: any) {
          console.error("Error adding network:", addError)
          toast({
            title: "Failed to add network",
            description: addError.message || "Could not add Tea Sepolia network",
            variant: "destructive",
          })
        }
      } else {
        console.error("Error switching network:", switchError)
        toast({
          title: "Failed to switch network",
          description: switchError.message || "Could not switch to Tea Sepolia network",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <WalletContext.Provider
      value={{
        account,
        balance,
        chainId,
        isCorrectNetwork,
        isConnecting,
        provider,
        contract,
        connectWallet,
        disconnectWallet,
        switchNetwork,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => useContext(WalletContext)
