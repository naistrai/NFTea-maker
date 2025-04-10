"use client"

import type React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExternalLink, Loader2, Upload } from "lucide-react"
import { useWallet } from "@/context/wallet-context"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import Link from "next/link"

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  imageUrl: z.string().optional(),
})

export function CreateNFT() {
  const { toast } = useToast()
  const { account, contract, isCorrectNetwork } = useWallet()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [uploadTab, setUploadTab] = useState<string>("upload") // Changed default to "upload"
  const [isUploading, setIsUploading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
    },
  })

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.includes("image")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Function to upload image to ImgHippo
  const uploadImageToImgHippo = async (imageData: string | File, title: string): Promise<string> => {
    setIsUploading(true)

    try {
      const formData = new FormData()

      // If imageData is a data URL (base64 string)
      if (typeof imageData === "string" && imageData.startsWith("data:")) {
        // Convert base64 to blob
        const response = await fetch(imageData)
        const blob = await response.blob()
        formData.append("file", blob, "image.jpg")
      } else if (imageData instanceof File) {
        // If imageData is already a File object
        formData.append("file", imageData)
      } else if (typeof imageData === "string") {
        // If it's a URL, return it directly
        return imageData
      }

      // Add API key and title
      formData.append("api_key", NEXT_PUBLIC_APP_IMGHIPPO_API)
      formData.append("title", title)

      const uploadResponse = await fetch("https://api.imghippo.com/v1/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`)
      }

      const data = await uploadResponse.json()

      if (data.success && data.data && data.data.url) {
        return data.data.url
      } else {
        throw new Error("Upload failed: No URL returned")
      }
    } catch (error: any) {
      console.error("Error uploading to ImgHippo:", error)
      throw new Error(`Image upload failed: ${error.message}`)
    } finally {
      setIsUploading(false)
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!account) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      })
      return
    }

    if (!isCorrectNetwork) {
      toast({
        title: "Wrong Network",
        description: "Please switch to Tea Sepolia network",
        variant: "destructive",
      })
      return
    }

    if (!contract) {
      toast({
        title: "Contract not loaded",
        description: "Please try again later",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Use either uploaded image or URL
      let imageURL = uploadTab === "upload" && uploadedImage ? uploadedImage : values.imageUrl || ""

      if (!imageURL) {
        toast({
          title: "Image required",
          description: "Please provide an image URL or upload an image",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Upload image to ImgHippo if it's not already a URL
      if (uploadTab === "upload" && uploadedImage) {
        try {
          // We don't show a toast for uploading anymore
          imageURL = await uploadImageToImgHippo(uploadedImage, values.name)
        } catch (error: any) {
          toast({
            title: "Upload failed",
            description: error.message || "Failed to upload image",
            variant: "destructive",
          })
          setIsSubmitting(false)
          return
        }
      }

      console.log("Minting NFT with:", {
        name: values.name,
        description: values.description,
        imageURL: imageURL,
        account: account,
      })

      // Verify contract has the mintNFT function before calling
      if (typeof contract.mintNFT !== "function") {
        throw new Error("Contract does not have mintNFT function. ABI might be incorrect.")
      }

      toast({
        title: "Transaction submitted",
        description: "Your NFT is being minted...",
        variant: "default",
      })

      const tx = await contract.mintNFT(values.name, values.description, imageURL)
      await tx.wait()

      toast({
        title: "Success!",
        description: (
          <div className="flex flex-col gap-2">
            <p>Your NFT has been minted successfully</p>
            <Link
              href={`https://sepolia.tea.xyz/tx/${tx.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-700 hover:text-green-800 flex items-center gap-1 text-sm"
            >
              View on Explorer <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        ),
        variant: "success",
      })

      // Reset form
      form.reset()
      setUploadedImage(null)
    } catch (error: any) {
      console.error("Error minting NFT:", error)

      let errorMessage = "Failed to mint NFT"

      // Try to extract the most useful error information
      if (error.reason) {
        errorMessage = error.reason
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message
      } else if (error.data && error.data.message) {
        errorMessage = error.data.message
      } else if (error.message) {
        // Clean up common error messages
        if (error.message.includes("missing revert data")) {
          errorMessage = "Contract execution failed. This could be due to contract restrictions or invalid input data."
        } else if (error.message.includes("user rejected")) {
          errorMessage = "Transaction was rejected in your wallet."
        } else {
          errorMessage = error.message
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-teal-100 shadow-sm">
      <CardHeader>
        <CardTitle className="text-teal-700">Create New NFT</CardTitle>
        <CardDescription>Fill in the details to mint your unique NFT on Tea Sepolia</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Awesome NFT" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe your NFT..." className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Image</FormLabel>
                  <Tabs value={uploadTab} onValueChange={setUploadTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="upload">Upload Image</TabsTrigger>
                      <TabsTrigger value="url">Image URL</TabsTrigger>
                    </TabsList>
                    <TabsContent value="upload" className="pt-4">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 w-full text-center cursor-pointer hover:bg-muted/50 transition-colors">
                          <Input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="image-upload"
                            onChange={(e) => {
                              handleImageUpload(e)
                              // Clear the URL field when uploading a file
                              field.onChange("")
                            }}
                          />
                          <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                          </label>
                        </div>

                        {uploadedImage && (
                          <div className="relative w-full h-40 mt-2">
                            <Image
                              src={uploadedImage || "/placeholder.svg"}
                              alt="Uploaded preview"
                              fill
                              className="object-contain rounded-md"
                            />
                          </div>
                        )}
                      </div>
                    </TabsContent>
                    <TabsContent value="url" className="pt-4">
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} />
                      </FormControl>
                      <FormDescription>Enter a URL to your image</FormDescription>
                      <FormMessage />
                    </TabsContent>
                  </Tabs>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700"
              disabled={isSubmitting || isUploading || !account || !isCorrectNetwork}
            >
              {isSubmitting || isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isUploading ? "Uploading..." : "Minting..."}
                </>
              ) : (
                "Mint NFT"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
