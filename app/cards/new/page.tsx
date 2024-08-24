"use client" // This is a client component 👈🏽

// URL: /cards/new
// This page allows the user to upload the front and back images of a business and analyze it.

import Image from "next/image"
import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import React, { useState, useContext, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthContext } from "@/contexts/authContext"
import withAuth from "@/components/withAuth"
import { User } from "firebase/auth"
import { toast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { CreditCard, Globe2, HelpCircle, Loader2, PlusCircle } from "lucide-react"

import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"


type Checked = DropdownMenuCheckboxItemProps["checked"]

// Response from POST /business_cards endpoint
interface PostBusinessCardsResponse {
  data: {
    attributes: {
      code: string
    }
  }
}

// Type for supported languages
type BusinessCardLanguage = {
  languageCode: "fr" | "en" | "ja"
  icon: string
  checked: Checked
}

function NewCard() {
  const router = useRouter()
  const { user } = useContext(AuthContext) as { user: User }

  const [frontImage, setFrontImage] = useState<File | null>(null) // Front image of business card
  const [backImage, setBackImage] = useState<File | null>(null) // Back image of business card
  const [analyzing, setAnalyzing] = useState<boolean>(false) // State of the business card analysis (set to true when the user clicks the "Add & Analyze" button)

  // Corresponds to the languages of the business card
  const [businessCardLanguages, setbusinessCardLanguages] = useState<BusinessCardLanguage[]>([
    { languageCode: "en", icon: "🇬🇧", checked: true },
    { languageCode: "fr", icon: "🇫🇷", checked: true },
    { languageCode: "ja", icon: "🇯🇵", checked: true },
  ])

  useEffect(() => {
    // Set the language hints from local storage
    const languageHints = window.localStorage.getItem("languageHints")

    if (languageHints) {
      setbusinessCardLanguages((prev) =>
        prev.map((l) => {
          if (languageHints.includes(l.languageCode)) {
            return { ...l, checked: true }
          } else {
            return { ...l, checked: false }
          }
        })
      )
    }
  }, [])

  useEffect(() => {
    // If no languages are selected, select English by default
    if (businessCardLanguages.every((l) => !l.checked)) {
      setbusinessCardLanguages((prev) =>
        prev.map((l) => {
          if (l.languageCode === "en") {
            return { ...l, checked: true }
          }

          return l
        })
      )
    }
  }, [businessCardLanguages])

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
    try {
        e.preventDefault() // Prevent the form from submitting
        setAnalyzing(true)

        // Check if the user uploaded both front and back images
        if (!frontImage) {
          toast({
            title: "We need at least the front image.",
            description: "Please upload the front image of the business card.",
          })

          setAnalyzing(false)
          return
        }

        // Create a FormData object to send the images to the server
        const formData = new FormData()
        formData.set("business_card[front_image]", frontImage as Blob);

        // Only add the back image if the user uploaded it
        if (backImage) {
          formData.set("business_card[back_image]", backImage as Blob);
        }

        formData.set("language_hints", JSON.stringify(businessCardLanguages.filter((l) => l.checked).map((l) => l.languageCode)))

        // Show a toast message if telling the business card is being analyzed
        toast({
          title: "Analyzing business card...",
          description: "Please wait while we analyze your business card.",
        })

        // Save the language hints to local storage
        // So the user can save time when they add another business card
        window.localStorage.setItem(
          "languageHints",
          JSON.stringify(businessCardLanguages.filter((l) => l.checked).map((l) => l.languageCode))
        )

        // Send the images to the server to analyze
        const firebaseToken = await user.getIdToken()
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_API_URL}/business_cards`,
          {
            method: "POST",
            body: formData,
            headers: { "x-firebase-token": firebaseToken },
          }
        )

        if (!response.ok) {
          throw new Error(
            `Failed to upload the business card | ${response.status}`
          )
        }

        const data = (await response.json()) as PostBusinessCardsResponse

        setAnalyzing(false) // Set analyzing state to false after the server responds
        router.push(`/cards/${data.data.attributes.code}`) // Redirect the user to the business card page
      } catch (error) {
        console.error("[matomeishi]", error)

        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "There was a problem with our server.",
        })

        setAnalyzing(false)
      }
    }

    // Callback function when the user clicks the checkbox of a supported language
    const onClickLanguageCheckbox = (languageCode: string, checked: Checked) => {
      setbusinessCardLanguages((prev) =>
        prev.map((l) => {
          if (l.languageCode === languageCode) {
            return { ...l, checked }
          }

          return l
        })
    )
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
          Submit images of your business card&lsquo;s front and back.
          We&lsquo;ll analyze the images and extract the information from the
          business card.
        </p>

        {/* Upload front image of business card */}
        <form className="py-4" onSubmit={onSubmit}>
          <div>
            <div className="mb-2 flex items-center">
              <div className="text-sm font-semibold mr-2 flex items-center"><Globe2 className="w-4 h-4 mr-2" />Languages </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-4 h-4 cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Please include the languages used on your business cards.<br />The selected languages will be kept in memory on your browser for next time.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex items-center gap-2">
              {/* Show preview of suppported languages */}
              <div className="flex flex-wrap gap-2">
                {businessCardLanguages
                  .filter((l) => l.checked)
                  .map((l) => (
                    <div
                      key={l.languageCode}
                      className="px-2 py-1 bg-gray-100 rounded-lg text-sm"
                    >
                      {l.icon}
                    </div>
                  ))}
              </div>

                {/* Supported languages dropdown menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Modify</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Languages</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem
                    checked={businessCardLanguages.find((l) => l.languageCode === "en")?.checked}
                    onCheckedChange={(checked) => { onClickLanguageCheckbox("en", checked) }}
                  >
                    English 🇬🇧
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={businessCardLanguages.find((l) => l.languageCode === "fr")?.checked}
                    onCheckedChange={(checked) => { onClickLanguageCheckbox("fr", checked) }}
                  >
                    French 🇫🇷
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={businessCardLanguages.find((l) => l.languageCode === "ja")?.checked}
                    onCheckedChange={(checked) => { onClickLanguageCheckbox("ja", checked) }}
                  >
                    Japanese 🇯🇵
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/2 py-4">
              <div className="mb-4">
                <div className="mb-2">
                  <div className="text-sm font-semibold relative">Front Image<Badge variant="destructive" className="absolute right-0 rounded text-xs ml-1">Required</Badge></div>
                </div>
                <input
                  id="front"
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                  type="file"
                  accept="image/png, image/gif, image/jpeg"
                  disabled={analyzing}
                  onChange={(e) => {
                    onUploadImage(e, "front")
                  }}
                />
              </div>
              {/* Show preview of uploaded front image */}
              {frontImage ? (
                <div
                  className="w-100 bg-cover bg-center relative h-64"
                  style={{
                    backgroundImage: `url('${URL.createObjectURL(
                      frontImage
                    )}')`,
                  }}
                ></div>
              ) : (
                <Skeleton className="w-full h-64" />
              )}
            </div>

            {/* Upload back image of business card */}
            <div className="w-full md:w-1/2 py-4">
              <div className="mb-4">
                <div className="text-sm font-semibold mb-2">Back Image</div>
                <input
                  id="back"
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                  type="file"
                  accept="image/png, image/gif, image/jpeg"
                  disabled={analyzing}
                  onChange={(e) => {
                    onUploadImage(e, "back")
                  }}
                />
              </div>

              {/* Show preview of uploaded back image */}
              {backImage ? (
                <div
                  className="w-100 bg-cover bg-center relative h-64"
                  style={{
                    backgroundImage: `url('${URL.createObjectURL(backImage)}')`,
                  }}
                ></div>
              ) : (
                <Skeleton className="w-full h-64" />
              )}
            </div>
          </div>

          {/* Submit button */}
          <div className="w-full text-center">
            <Button disabled={analyzing}>
              {analyzing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <PlusCircle className="mr-2 h-4 w-4" />
              )}
              Add & Analyze
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
}

export default withAuth(NewCard)
