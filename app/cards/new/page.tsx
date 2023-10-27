"use client" // This is a client component 👈🏽

// URL: /cards/new
// This page allows the user to upload the front and back images of a business and analyze it.

import Image from "next/image"
import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import React, { useState, useContext } from "react"
import { useRouter } from "next/navigation"
import { AuthContext } from "@/contexts/authContext"
import withAuth from "@/components/withAuth"
import { User } from "firebase/auth"
import { toast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { CreditCard, Loader2, PlusCircle } from "lucide-react"

// Response from POST /business_cards endpoint
interface PostBusinessCardsResponse {
  data: {
    attributes: {
      code: string
    }
  }
}

export function Card() {
  const router = useRouter()
  const { user } = useContext(AuthContext) as { user: User }

  const [frontImage, setFrontImage] = useState<File | null>(null) // Front image of business card
  const [backImage, setBackImage] = useState<File | null>(null) // Back image of business card
  const [analyzing, setAnalyzing] = useState<boolean>(false) // State of the business card analysis (set to true when the user clicks the "Add & Analyze" button)

  /***** Functions *****/

  // Callback function when the user uploads an image
  const onUploadImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "front" | "back"
  ) => {
    // Check if the user uploaded an image file
    if (!e.target.files) {
      return
    }

    if (analyzing) {
      return
    }

    if (type === "front") {
      setFrontImage(e.target.files[0])
    } else if (type === "back") {
      setBackImage(e.target.files[0])
    }
  }

  // Callback function when the user clicks the "Add & Analyze" button
  // The user will be redirected to the business card page after the server responds
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault() // Prevent the form from submitting
    setAnalyzing(true)

    // Check if the user uploaded both front and back images
    if (!frontImage || !backImage) {
      toast({
        title: "We need both front and back images.",
        description: "Please upload both front and back images.",
      })

      setAnalyzing(false)
      return
    }

    // Create a FormData object to send the images to the server
    const formData = new FormData()
    formData.set("front_image", frontImage as Blob)
    formData.set("back_image", backImage as Blob)

    // Show a toast message if telling the business card is being analyzed
    toast({
      title: "Analyzing business card...",
      description: "Please wait while we analyze your business card.",
    })

    // Send the images to the server to analyze
    const firebaseToken = await user.getIdToken()
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_API_URL}/business_cards`,
      {
        method: "POST",
        body: formData,
        headers: { "x-firebase-token": firebaseToken }
      }
    )

    const data = await response.json() as PostBusinessCardsResponse

    setAnalyzing(false) // Set analyzing state to false after the server responds
    router.push(`/cards/${data.data.attributes.code}`) // Redirect the user to the business card page
  }

  return (
    <main>
      <Header />

      <div className="container mx-auto max-w-screen-lg p-4">
        <Button
          variant="secondary"
          onClick={() => {
            router.push("/cards")
          }}
        >
          Back
        </Button>

        <Separator className="my-4" />

        <div className="flex items-center">
          <CreditCard className="mr-2 h-6 w-6" />
          <h1 className="text-2xl font-semibold">Add a Business Card</h1>
        </div>

        <p className="text-sm text-muted-foreground">
            Submit images of your business card&rsquo;s front and back.
            We&rsquo;ll analyze the images and extract the information from the business card.
        </p>

        {/* Upload front image of business card */}
        <form className="py-4" onSubmit={onSubmit}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/2 py-4">
              <div className="mb-4">
                <div className="mb-2">
                  <div className="text-sm font-semibold">Front Image</div>
                </div>
                <input
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                  type="file"
                  accept="image/png, image/gif, image/jpeg"
                  disabled={analyzing}
                  onChange={(e) => { onUploadImage(e, "front") }}
                />
              </div>
              {/* Show preview of uploaded front image */}
              {
                frontImage ?
                <div className="w-100 bg-cover bg-center relative h-64" style={{backgroundImage: `url('${URL.createObjectURL(frontImage)}')`}} ></div>
                :
                <Skeleton className="w-full h-64" />
              }

            </div>

            {/* Upload back image of business card */}
            <div className="w-full md:w-1/2 py-4">
              <div className="mb-4">
                <div className="text-sm font-semibold mb-2">Back Image</div>
                <input
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                  type="file"
                  accept="image/png, image/gif, image/jpeg"
                  disabled={analyzing}
                  onChange={(e) => { onUploadImage(e, "back") }}
                />
              </div>

              {/* Show preview of uploaded back image */}
              {
                backImage ?
                  <div className="w-100 bg-cover bg-center relative h-64" style={{backgroundImage: `url('${URL.createObjectURL(backImage)}')`}} ></div>
                :
                <Skeleton className="w-full h-64" />
              }

            </div>
          </div>

          {/* Submit button */}
          <div className="w-full text-center">
            <Button disabled={analyzing}>
              { analyzing ?
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                :
                <PlusCircle className="mr-2 h-4 w-4"/>
              }
              Analyze
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
}

export default withAuth(Card)
