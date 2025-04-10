"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useWallet } from "@/context/wallet-context"
import { useToast } from "@/hooks/use-toast"
import { ChevronLeft, ChevronRight, Loader2, RefreshCw } from "lucide-react"
import Image from "next/image"

interface NFTData {
  id: number
  name: string
  description: string
  imageURL: string
}

export function NFTCollection() {
  const { toast } = useToast()
  const { account, contract, isCorrectNetwork } = useWallet()
  const [nfts, setNfts] = useState<NFTData[]>([])
  const [loading, setLoading] = useState(false)
  const [totalNFTs, setTotalNFTs] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 4

  const fetchNFTs = async () => {
    if (!account || !contract || !isCorrectNetwork) return

    try {
      setLoading(true)

      // Get balance of user
      const balance = await contract.balanceOf(account)
      const balanceNumber = Number(balance)
      setTotalNFTs(balanceNumber)

      if (balanceNumber === 0) {
        setNfts([])
        return
      }

      const nftData: NFTData[] = []

      // Calculate pagination limits
      const startIndex = (currentPage - 1) * itemsPerPage
      let endIndex = startIndex + itemsPerPage
      if (endIndex > balanceNumber) {
        endIndex = balanceNumber
      }

      // We need to find which token IDs belong to the user
      // This is a simplified approach - in a real app, you might need to use events or other methods
      // to efficiently find the token IDs owned by the user
      let tokenId = 0
      let found = 0
      let displayedCount = 0

      // We'll check token IDs to find the ones owned by the user
      while (found < balanceNumber && tokenId < 1000 && displayedCount < endIndex) {
        try {
          const owner = await contract.ownerOf(tokenId)

          if (owner.toLowerCase() === account.toLowerCase()) {
            found++

            // Only add NFTs for the current page
            if (found > startIndex && found <= endIndex) {
              // Get token data
              const data = await contract.tokenIdToData(tokenId)

              nftData.push({
                id: tokenId,
                name: data.name,
                description: data.description,
                imageURL: data.imageURL,
              })

              displayedCount++
            }
          }
        } catch (error) {
          // Token doesn't exist or other error, continue to next ID
        }

        tokenId++
      }

      setNfts(nftData)
    } catch (error: any) {
      console.error("Error fetching NFTs:", error)
      toast({
        title: "Error",
        description: "Failed to load your NFT collection",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (account && contract && isCorrectNetwork) {
      fetchNFTs()
    }
  }, [account, contract, isCorrectNetwork, currentPage])

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    const maxPages = Math.ceil(totalNFTs / itemsPerPage)
    if (currentPage < maxPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  if (!account) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-teal-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-teal-700">My NFT Collection</CardTitle>
          <CardDescription>Connect your wallet to view your NFTs</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-teal-100 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-teal-700">My NFT Collection</CardTitle>
          <CardDescription>View all your NFTs on Tea Sepolia</CardDescription>
        </div>
        <Button variant="outline" size="icon" onClick={fetchNFTs} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <NFTSkeleton />
            <NFTSkeleton />
          </div>
        ) : nfts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {totalNFTs > 0 ? "No NFTs found on this page" : "You don't have any NFTs yet"}
            </p>
            {totalNFTs === 0 && (
              <Button variant="link" className="mt-2 text-teal-600" onClick={() => (window.location.href = "/")}>
                Create your first NFT
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nfts.map((nft) => (
              <NFTCard key={nft.id} nft={nft} />
            ))}
          </div>
        )}
      </CardContent>
      {totalNFTs > itemsPerPage && (
        <CardFooter className="flex justify-between items-center pt-2">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {Math.ceil(totalNFTs / itemsPerPage)}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={currentPage === 1 || loading}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage >= Math.ceil(totalNFTs / itemsPerPage) || loading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}

function NFTCard({ nft }: { nft: NFTData }) {
  return (
    <Card className="overflow-hidden border-teal-100">
      <div className="relative aspect-square w-full">
        <Image
          src={
            nft.imageURL.startsWith("data:") ? nft.imageURL : nft.imageURL || "/placeholder.svg?height=200&width=200"
          }
          alt={nft.name}
          fill
          className="object-cover"
        />
      </div>
      <CardHeader className="p-4">
        <CardTitle className="text-lg">{nft.name}</CardTitle>
        <CardDescription className="line-clamp-2">{nft.description}</CardDescription>
      </CardHeader>
      <CardFooter className="p-4 pt-0 text-xs text-muted-foreground">Token ID: {nft.id}</CardFooter>
    </Card>
  )
}

function NFTSkeleton() {
  return (
    <Card className="overflow-hidden border-teal-100">
      <Skeleton className="aspect-square w-full" />
      <CardHeader className="p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full mt-2" />
      </CardHeader>
      <CardFooter className="p-4 pt-0">
        <Skeleton className="h-3 w-1/4" />
      </CardFooter>
    </Card>
  )
}
