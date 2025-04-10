"use client"

import { useWallet } from "@/context/wallet-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, Loader2, Wallet } from "lucide-react"
import Image from "next/image"

export function WelcomePage() {
  const { connectWallet, isConnecting } = useWallet()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-teal-50 p-4">
      <div className="w-full max-w-md flex flex-col flex-1 justify-center">
        <Card className="bg-white/80 backdrop-blur-sm border-teal-100 shadow-sm">
          <CardHeader className="flex flex-col items-center">
            <div className="relative w-24 h-24 mb-4">
              <Image src="/nftea-logo.ico" alt="NFTea Logo" fill className="object-contain" />
            </div>
            <CardTitle className="text-3xl font-bold text-teal-700">NFTea</CardTitle>
            <CardDescription className="text-center">
              Create and collect unique NFTs on Tea Sepolia network
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col items-center">
            <div className="mb-6 p-6 bg-teal-50 rounded-full">
              <Wallet className="w-12 h-12 text-teal-600" />
            </div>
            <p className="text-center mb-6">
              NFTea allows you to mint your own unique NFTs on the Tea Sepolia network. Connect your MetaMask wallet to
              get started.
            </p>
          </CardContent>

          <CardFooter>
            <Button onClick={connectWallet} disabled={isConnecting} className="w-full bg-teal-600 hover:bg-teal-700">
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting
                </>
              ) : (
                <>
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect Wallet
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="container mx-auto max-w-md mt-8 mb-2 text-center">
        <a
          href="https://sepolia.tea.xyz/address/0x3d3798aC5827718850008bc2A33C51D1033aa956"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-teal-600 hover:text-teal-700 flex items-center justify-center gap-1"
        >
          View Contract on Tea Sepolia Explorer
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <footer className="container mx-auto max-w-md text-center text-sm text-muted-foreground">
        <p>NFTea - Mint your tea-inspired NFTs on Tea Sepolia</p>
      </footer>
    </div>
  )
}
