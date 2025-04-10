"use client"

import { useState, useRef, useEffect } from "react"
import { useWallet } from "@/context/wallet-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronDown, Copy, ExternalLink, LogOut, X } from "lucide-react"
import { formatAddress } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

export function WalletNav() {
  const { account, balance, disconnectWallet, isCorrectNetwork, switchNetwork } = useWallet()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [showNetworkInfo, setShowNetworkInfo] = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)

  const handleCopyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account)
      toast({
        title: "Address copied",
        description: "Wallet address copied to clipboard",
      })
    }
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
      setIsOpen(false)
      setShowNetworkInfo(false)
    }
  }

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  if (!account) return null

  return (
    <div className="relative">
      <Button
        variant="outline"
        className="flex items-center gap-2 bg-white rounded-full border-teal-100 pr-2 pl-4 h-10"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium">{balance} TEA</span>
        <div className="w-6 h-6 rounded-full bg-yellow-300 flex items-center justify-center overflow-hidden">
          <Image src="/nftea-logo.ico" alt="NFTea Logo" width={20} height={20} className="object-contain" />
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </Button>

      {isOpen && (
        <div ref={popupRef} className="absolute right-0 top-12 z-50 w-80 animate-in fade-in-50 zoom-in-95">
          <Card className="bg-white shadow-lg rounded-xl overflow-hidden">
            {showNetworkInfo ? (
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Network Information</h3>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowNetworkInfo(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium">Network Name</p>
                    <p className="text-muted-foreground">Tea Sepolia</p>
                  </div>

                  <div>
                    <p className="font-medium">Public RPC URL</p>
                    <div className="flex items-center gap-1">
                      <p className="text-muted-foreground text-xs truncate">https://tea-sepolia.g.alchemy.com/public</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => {
                          navigator.clipboard.writeText("https://tea-sepolia.g.alchemy.com/public")
                          toast({
                            title: "RPC URL copied",
                            description: "RPC URL copied to clipboard",
                          })
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <p className="font-medium">Chain ID</p>
                    <p className="text-muted-foreground">10218</p>
                  </div>

                  <div>
                    <p className="font-medium">Currency Symbol</p>
                    <p className="text-muted-foreground">TEA</p>
                  </div>

                  <div>
                    <p className="font-medium">Block Explorer URL</p>
                    <div className="flex items-center gap-1">
                      <a
                        href="https://sepolia.tea.xyz"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-600 hover:underline text-xs flex items-center"
                      >
                        https://sepolia.tea.xyz
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </div>

                  <div>
                    <p className="font-medium">Faucet</p>
                    <div className="flex items-center gap-1">
                      <a
                        href="https://faucet-sepolia.tea.xyz/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-600 hover:underline text-xs flex items-center"
                      >
                        https://faucet-sepolia.tea.xyz/
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="p-4 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-yellow-300 flex items-center justify-center mb-3">
                    <span className="text-2xl">🤑</span>
                  </div>
                  <h3 className="text-lg font-bold">{formatAddress(account)}</h3>
                  <p className="text-muted-foreground">{balance} TEA</p>

                  {/* Network status */}
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${isCorrectNetwork ? "bg-green-500" : "bg-red-500"}`}></span>
                    <span className="text-sm">{isCorrectNetwork ? "Tea Sepolia" : "Wrong Network"}</span>
                  </div>

                  {/* Switch network button - only show if on wrong network */}
                  {!isCorrectNetwork && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 text-xs text-teal-600 border-teal-200"
                      onClick={() => {
                        switchNetwork()
                        setIsOpen(false)
                      }}
                    >
                      Switch to Tea Sepolia
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 p-4 pt-0">
                  <Button
                    variant="outline"
                    className="flex items-center justify-center gap-2"
                    onClick={handleCopyAddress}
                  >
                    <Copy className="h-4 w-4" />
                    Copy Address
                  </Button>
                  <Button
                    variant="outline"
                    className="flex items-center justify-center gap-2"
                    onClick={disconnectWallet}
                  >
                    <LogOut className="h-4 w-4" />
                    Disconnect
                  </Button>
                </div>

                <div
                  className="p-4 border-t border-gray-100 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setShowNetworkInfo(true)}
                >
                  <p className="text-sm text-teal-600">View Network Information</p>
                </div>
              </>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
