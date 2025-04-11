"use client"

import type React from "react"

import { useRouter, usePathname } from "next/navigation"
import { useWallet } from "@/context/wallet-context"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, ExternalLink } from "lucide-react"
import Image from "next/image"
import { WalletNav } from "@/components/wallet-nav"
import { WelcomePage } from "@/components/welcome-page"

export function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { account, isCorrectNetwork, switchNetwork } = useWallet()

  // If wallet is not connected, show welcome page
  if (!account) {
    return <WelcomePage />
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-green-50 to-teal-50 p-4">
      <header className="container mx-auto max-w-md mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Image src="/nftea-logo.ico" alt="NFTea Logo" width={32} height={32} />
            <h1 className="text-2xl font-bold text-teal-700">NFTea</h1>
          </div>
          <WalletNav />
        </div>

        {!isCorrectNetwork ? (
          <Card className="bg-white/80 backdrop-blur-sm border-red-100 shadow-sm mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Wrong Network
              </CardTitle>
              <CardDescription>
                You are not connected to the Tea Sepolia network. Please switch networks to use this application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={switchNetwork} className="w-full bg-teal-600 hover:bg-teal-700">
                Switch to Tea Sepolia
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue={pathname === "/collection" ? "collection" : "create"} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="create"
                onClick={() => router.push("/")}
                className="data-[state=active]:bg-teal-600 data-[state=active]:text-white"
              >
                Create NFT
              </TabsTrigger>
              <TabsTrigger
                value="collection"
                onClick={() => router.push("/collection")}
                className="data-[state=active]:bg-teal-600 data-[state=active]:text-white"
              >
                My Collection
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </header>

      <main className="container mx-auto max-w-md flex-1">
        {isCorrectNetwork ? (
          children
        ) : (
          <Card className="bg-white/80 backdrop-blur-sm border-teal-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-teal-700">Network Required</CardTitle>
              <CardDescription>Please switch to the Tea Sepolia network to create and view your NFTs.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-8">
              <div className="mb-4 text-center text-muted-foreground">
                <p>Tea Sepolia network is required to interact with the NFTea smart contract.</p>
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <p>
                  <strong>Network Name:</strong> Tea Sepolia
                </p>
                <p>
                  <strong>Chain ID:</strong> 10218
                </p>
                <p>
                  <strong>Currency Symbol:</strong> TEA
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

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
