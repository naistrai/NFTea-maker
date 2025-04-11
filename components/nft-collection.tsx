"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useWallet } from "@/context/wallet-context"
import { useToast } from "@/hooks/use-toast"
import { ChevronLeft, ChevronRight, ImageOff, Loader2, RefreshCw } from "lucide-react"
import Image from "next/image"

// Define interfaces based on the API response
interface NFTOwner {
  hash: string
}

interface NFTToken {
  address: string
  name: string
  symbol: string
  type: string
}

interface NFTMetadata {
  name: string
  description: string
  image: string
}

interface NFTData {
  id: string
  image_url: string
  media_url: string
  metadata: NFTMetadata
  owner: NFTOwner
  token: NFTToken
}

export function NFTCollection() {
  const { toast } = useToast()
  const { account, isCorrectNetwork } = useWallet()
  const [nfts, setNfts] = useState<NFTData[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 4

  const CONTRACT_ADDRESS = "0x3d3798aC5827718850008bc2A33C51D1033aa956"

  const fetchNFTs = async () => {
    if (!account || !isCorrectNetwork) return

    try {
      setLoading(true)

      // Fetch NFTs from the Tea Sepolia API
      const apiUrl = `https://sepolia.tea.xyz/api/v2/tokens/${CONTRACT_ADDRESS}/instances?holder_address_hash=${account}`

      const response = await fetch(apiUrl)

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      const data = await response.json()

      // Calculate total pages
      const totalItems = data.items?.length || 0
      setTotalPages(Math.max(1, Math.ceil(totalItems / itemsPerPage)))

      // Get items for current page
      const startIndex = (currentPage - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      const pageItems = data.items?.slice(startIndex, endIndex) || []

      setNfts(pageItems)
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
    if (account && isCorrectNetwork) {
      fetchNFTs()
    }
  }, [account, isCorrectNetwork, currentPage])

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NFTSkeleton />
            <NFTSkeleton />
            <NFTSkeleton />
            <NFTSkeleton />
          </div>
        ) : nfts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">You don't have any NFTs yet</p>
            <Button variant="link" className="mt-2 text-teal-600" onClick={() => (window.location.href = "/")}>
              Create your first NFT
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nfts.map((nft) => (
              <NFTCard key={nft.id} nft={nft} />
            ))}
          </div>
        )}
      </CardContent>
      {totalPages > 1 && (
        <CardFooter className="flex justify-between items-center pt-2">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={currentPage === 1 || loading}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage >= totalPages || loading}
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
  // Use the appropriate image URL from the API response
  const imageUrl = nft.image_url || nft.media_url || nft.metadata?.image || "/placeholder.svg?height=200&width=200"
  const [imageError, setImageError] = useState(false)

  return (
    <Card className="overflow-hidden border-teal-100">
      <div className="relative aspect-square w-full overflow-hidden group">
        {imageError ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="flex flex-col items-center text-gray-400">
              <ImageOff className="h-12 w-12 mb-2" />
              <span className="text-sm">Image not available</span>
            </div>
          </div>
        ) : (
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={nft.metadata?.name || `NFT #${nft.id}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        )}
      </div>
      <CardHeader className="p-4">
        <CardTitle className="text-lg">{nft.metadata?.name || `NFT #${nft.id}`}</CardTitle>
        <CardDescription className="line-clamp-2">{nft.metadata?.description || "No description"}</CardDescription>
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
