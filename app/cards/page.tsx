"use client" // This is a client component 👈🏽

// URL: /cards
// This is the page that displays all the business cards
// This page is only accessible if the user is logged in
// The user can search for business cards by name, company, email, mobile phone, and tags
// Upon clicking on a business card, the user is redirected to the business card page

import Header from "@/components/header"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { BusinessCard, BusinessCardResponse, BusinessCardsResponse, Tag, TagResponse } from "@/types/BusinessCard"
import { useRouter, useSearchParams } from "next/navigation"
import React, { useState, useEffect, useContext } from "react"
import { AuthContext } from "../../contexts/authContext"
import { Pagination, PaginationInfo } from "@/components/pagination"
import withAuth from "../../components/withAuth"
import { User } from "firebase/auth"
import { toast } from "@/components/ui/use-toast"
import { FileSpreadsheet, WalletCards } from "lucide-react"
import { Button } from "@/components/ui/button"

// This is the type of the search tags that are displayed below the search bar
type SearchTag = Tag & { selected: boolean }

function Cards() {
  const router = useRouter() // This is a hook that gives us access to the router
  const searchParams = useSearchParams() // This is a hook that returns the query string params

  const { user } = useContext(AuthContext) as { user: User }

  const [businessCards, setBusinessCards] = useState<BusinessCard[]>([]) // Corresponds to the list of business cards fetched from the API
  const [search, setSearch] = useState<string>("") // Corresponds to the user input in the search bar
  const [searchTags, setSearchTags] = useState<SearchTag[]>([]) // Corresponds to the tags that are displayed below the search bar
  const [params, setParams] = useState<URLSearchParams>(new URLSearchParams()) // Corresponds to the params that we will use to fetch data
  const [isLoadingCsv, setIsLoadingCsv] = useState<boolean>(false) // isLoadingCsv is true when the user clicks the "Export as CSV" button

  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    isLastPage: true,
  }) // Corresponds to the pagination info fetched from the API

  // Called once when the component is mounted
  // This is where we will read the query string and set the state
  // to match the query string (page number, search string, tags)
  useEffect(() => {
    const page = searchParams.get('page')
    const q = searchParams.get('q')
    const tags = searchParams.getAll('tags[]')

    // Reload the page without query string if any of the params are not valid
    // Reload page without query string if page is not a number
    if (page && isNaN(Number(page))) {
      router.push("/cards")
      return
    }

    // Reload page without query string if q is equal to null
    if (q && q === "null") {
      router.push("/cards")
      return
    }

    // Reload page without query string if tags are not numbers
    if (tags.some((tag) => isNaN(Number(tag)))) {
      router.push("/cards")
      return
    }

    // Set the params to the query string
    const newParams = new URLSearchParams()

    // Set page if it is a number and not null
    if (page && !isNaN(Number(page))) {
      newParams.set("page", page as string)
    }

    // Set q if it is not null and not an empty string
    if (q && q !== "") {
      newParams.set("q", q as string)
    }

    tags.forEach((tag) => {
      // Set tags if it is a number (it is an ID) and not null
      if (tag && !isNaN(Number(tag))) {
        newParams.append("tags[]", tag)
      }
    })

    setSearch(q || "") // Set the search string to the query string
    setParams(newParams) // Set the params that we will use to fetch data
  }, [])

  // Called when the params change
  // This is where we will fetch the data from the API
  // We fetch both the business cards and the tags (for filtering)
  useEffect(() => {
    fetchBusinessCards()
    fetchTags()
  }, [params])

  /***** Functions *****/

  // Function to fetch business cards from API
  const fetchBusinessCards = async () => {
    try {
      const firebaseToken = await user.getIdToken() // Get the Firebase access token
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_API_URL}/business_cards?${params.toString()}`, { headers: { "x-firebase-token": firebaseToken }})

      if (!response.ok) {
        throw new Error(`Failed to fetch the business cards | ${response.status}`, )
      }

      const data = await response.json() as { business_cards: BusinessCardsResponse, current_page: number, total_count: number, total_pages: number, is_last_page: boolean }

      // Example of data returned from API
      //   {
      //     "business_cards": {
      //         "data": [
      //             {
      //                 "id": "52",
      //                 "type": "business_card",
      //                 "attributes": {
      //                     "id": 52,
      //                     "code": "e3dab8997958ff61c4f6",
      //                     "company": "CREATIVE DEVELOPERS",
      //                     "email": "info@creativedevelopers.com",
      //                     "fax": "gregerr",
      //                     "first_name": "KIM",
      //                     "home_phone": "8365-9686-6997",
      //                     "last_name": "LOU WAN",
      //                     "meeting_date": "2023-10-26T08:38:31.920Z",
      //                     "mobile_phone": "(987)-4575-9567",
      //                     "notes": "grergreergre\n\n絵wfrequentg",
      //                     "status": "analyzed",
      //                     "created_at": "2023-10-26T01:24:52.794Z",
      //                     "updated_at": "2023-10-26T12:29:38.220Z",
      //                     "front_image_url": "https://storage.googleapis.com/matomeishi/1/52-front-image?GoogleAccessId=google-cloud-storage%40matomeishi-401514.iam.gserviceaccount.com\u0026Expires=1698326369\u0026Signature=OPHiNHXBF6GlEGtiCsrjvbAOtRkzBTQEyYg4JH21mjUtOVF2zhKpqLJx4erycoK9XjZGWvM%2F8rtiXFHcTlvLL%2FCDcl8qzbiMND9egkOnU8i7WRaIQMc7ftOR3B7QHmeeY%2BO3OZ8C3q80WGDoEGtQeZzYSkkwZua908cTIUx7wAUXUudeF1kP0bHA5yeIL32IBcanHw8rriGT5aqB2P53joomQXqLXbvYPSvFfU1ca6RGf76OJNcvEC5p9vccKlh5Goip2fV0DxR%2BW43d7qwgyWTg0QB9YHy3WKr%2FTebifY%2BYQ4i2nq090lUyirJ0CKwtU3vGnw4E7DoCBrfFDC0t4A%3D%3D\u0026response-content-disposition=inline%3B+filename%3D%2252-front-image.png%22%3B+filename%2A%3DUTF-8%27%2752-front-image.png\u0026response-content-type=image%2Fpng",
      //                     "back_image_url": "https://storage.googleapis.com/matomeishi/1/52-back-image?GoogleAccessId=google-cloud-storage%40matomeishi-401514.iam.gserviceaccount.com\u0026Expires=1698326369\u0026Signature=ZgoeCZ8B50EdWmDpwFP0x0CHd8vTMP%2Bv4XPYAYuIPFPevtwDdcfSV6e2D99ro9SUTLuD9Qlgct9NCVDmhRG8acK12ZAwPiwIlPnoHeWCj0B%2FK5mhqTZad%2BgE15C7pZFhADO8iGy80jOa%2FYXwZZETtxxAnBgaXE1qQF0PGsvN%2BVtBRT8lyjWFSgVJTFZyEthQWybl%2F%2F5ltmCEfqXbK%2BobaIY7%2F7e2bSe2Tm8bZ0NzkGWLbtTDL2Y4hh9NMfulDpgakYJOxEx6PdIKwL0hKfM%2FB8NCO1G4axTd8bLStkjpTIv0w6ULvhGKddoj%2F814Yo9XOpdl5N2iwHW%2FdOnN1o23Tw%3D%3D\u0026response-content-disposition=inline%3B+filename%3D%2252-back-image.png%22%3B+filename%2A%3DUTF-8%27%2752-back-image.png\u0026response-content-type=image%2Fpng"
      //                 },
      //                 "relationships": {
      //                     "tags": {
      //                         "data": [
      //                             {
      //                                 "id": "4",
      //                                 "type": "tag"
      //                             },
      //                             {
      //                                 "id": "7",
      //                                 "type": "tag"
      //                             },
      //                             {
      //                                 "id": "8",
      //                                 "type": "tag"
      //                             }
      //                         ]
      //                     }
      //                 }
      //             }
      //         ],
      //         "included": [
      //             {
      //                 "id": "4",
      //                 "type": "tag",
      //                 "attributes": {
      //                     "id": 4,
      //                     "name": "miller_inc",
      //                     "description": "Saepe non culpa quos ea dolores laboriosam ullam nam facilis.",
      //                     "color": "#f16672"
      //                 }
      //             }
      //         ]
      //     },
      //     "current_page": 1,
      //     "total_count": 52,
      //     "total_pages": 5,
      //     "is_last_page": false
      // }

      // With FastJSONAPI, the data is returned in the "data" key and data from relationships is not included in the attributes object but returned in the "included" key
      // So we need to add the tags to the business cards attributes to make it easier to manipulate in the frontend
      const includedTags = data.business_cards.included
      const businessCards = data.business_cards.data

      const businessCardsWithTags = businessCards.map((businessCard: BusinessCardResponse) => {
        const tagIds = businessCard.relationships.tags.data.map((tag: TagResponse) => tag.id)
        const tags = includedTags.filter((tag) => tagIds.includes(tag.id)).map((tag) => tag.attributes)
        businessCard.attributes.tags = tags

        return businessCard.attributes
      })

      setBusinessCards(businessCardsWithTags)

      // Also set the pagination info that is returned from the API
      // Used in the Pagination component
      setPaginationInfo({
        currentPage: data.current_page,
        totalPages: data.total_pages,
        totalCount: data.total_count,
        isLastPage: data.is_last_page,
      })

    } catch (error) {
      console.error("[matomeishi]", error)

      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with our server.",
      })

      setBusinessCards([])
      setPaginationInfo({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        isLastPage: true,
      })
    }
  }

  // Function to fetch tags from API
  const fetchTags = async () => {
    try {
      const firebaseToken = await user.getIdToken() // Get the Firebase access token
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_API_URL}/tags`, { headers: { "x-firebase-token": firebaseToken }})

      if (!response.ok) {
        throw new Error(`Failed to fetch the tags | ${response.status}`, )
      }

      const data = await response.json() as { data: TagResponse[] }

      // Add all tags to the search tags below the search bar
      // Also set the selected property to true if the tag is in the query string
      const tags = data.data
      const searchTags = tags.map((tag) => {
        const tagIds = params.getAll("tags[]")
        const selected = tagIds.includes(tag.id)

        return {
          ...tag.attributes,
          selected: selected
        }
      })

      setSearchTags(searchTags)
    } catch (error) {
      console.error("[matomeishi]", error)

      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with our server.",
      })

      setSearchTags([])
    }
  }

  // Callback function for when the page is changed
  // Called when we click on a page number in the Pagination component
  // This function will change the query string (also params state) and call fetchBusinessCards()
  const onChangePage = async (page: number) => {
    const copiedParams = new URLSearchParams(params) // Copy the params
    copiedParams.set("page", page.toString())

    // Remove page from params if it is not a number
    if (isNaN(Number(copiedParams.get('page')))) {
      copiedParams.delete('page')
    }

    setParams(copiedParams) // Set the params state with the new page number

    window.history.pushState({}, "", window.location.pathname + "?" + copiedParams.toString()) // Change URL to append page number (without reloading the page)
  }

  // Callback function for when the search string is changed
  // Called when we type in the search bar
  // This function will change the query string (also params state) and call fetchBusinessCards()
  const onChangeQ = async (q: string) => {
    const copiedParams = new URLSearchParams(params) // Copy the params
    copiedParams.set("q", q)

    // Reset page to 1 if q is changed
    copiedParams.set("page", "1")

    // Remove q from params if it is empty or null
    if (copiedParams.get('q') === "" || copiedParams.get('q') === null) {
      copiedParams.delete('q')
    }

    setParams(copiedParams) // Set the params state with the new search string
    setSearch(q) // Set the search state with the new search string

    window.history.pushState({}, "", window.location.pathname + "?" + copiedParams.toString()) // Change URL to append page number (without reloading the page)
  }

  // Callback function for when a tag is clicked
  // Called when we click on a tag below the search bar
  // This function will change the query string (also params state) and call fetchBusinessCards()
  const onClickSearchTag = (tag: SearchTag) => {
    // Change selected property of the tag that was clicked
    const newSearchTags = searchTags.map((searchTag) => {
      if (searchTag.name === tag.name) {
        return {
          ...searchTag,
          selected: !searchTag.selected,
        }
      } else {
        return searchTag
      }
    })

    const copiedParams = new URLSearchParams(params) // Copy the params

    // If all tags are selected, remove tags from params and deselect all tags
    const numberOfSelectedTags = newSearchTags.filter((searchTag) => (searchTag.selected)).length
    copiedParams.delete("tags[]")

    if (numberOfSelectedTags !== 0 && numberOfSelectedTags !== newSearchTags.length) {
      newSearchTags.filter((searchTag) => (searchTag.selected)).forEach((searchTag) => {
        copiedParams.append("tags[]", searchTag.id.toString())
      })
    }

    // Reset page to 1 if tags are changed
    copiedParams.set("page", "1")

    setParams(copiedParams) // Set the params state with the new tags
    setSearchTags(newSearchTags) // Set the search tags state with the new tags

    window.history.pushState({}, "", window.location.pathname + "?" + copiedParams.toString()) // Change URL to append page number (without reloading the page)
  }

  // Callback function for when the "Export as CSV" button is clicked
  // Called when we click on the "Export as CSV" button
  // This function will call the API to export the business cards as CSV
  const onClickExportCsv = async () => {
    setIsLoadingCsv(true)

    try {
      const firebaseToken = await user.getIdToken() // Get the Firebase access token
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_API_URL}/business_cards/export`, { headers: { "x-firebase-token": firebaseToken }})

      if (!response.ok) {
        throw new Error(`Failed to export to CSV | ${response.status}`, )
      }

      const data = await response.blob()

      // Create a URL for the CSV file and download it
      const url = window.URL.createObjectURL(data)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'business_cards.csv')
      document.body.appendChild(link)
      link.click()

      setIsLoadingCsv(false)
    } catch (error) {
      console.error("[matomeishi]", error)

      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with our server.",
      })

      setIsLoadingCsv(false)
    }
  }

  return (
    <main>
      <Header />

      <div className="container mx-auto max-w-screen-lg p-4">
        <div className="flex items-center mb-4">
          <WalletCards className="mr-2 h-6 w-6" />
          <h1 className="text-2xl font-semibold">Gallery</h1>

          {/* Export CSV button */}
          <Button className="ml-auto" onClick={onClickExportCsv}><FileSpreadsheet className="w-4 h-4 mr-2" />Export as CSV</Button>
        </div>

        {/* Search bar */}
        <Input
          placeholder="Search..."
          className="w-full"
          value={search}
          onChange={(e) => onChangeQ(e.target.value)}
        />

        {/* Search tags */}
        <div className="p-4">
          <div className="flex flex-wrap gap-1">
            {searchTags.map((tag, index) => (
              <Badge
                key={index}
                onClick={(e) => onClickSearchTag(tag)}
                variant={tag.selected ? "default" : "outline"}
                className="cursor-pointer"
                style={{ backgroundColor: tag.color, color: "white", opacity: tag.selected ? 1 : 0.5 }}
              >{tag.name}</Badge>
            ))}
          </div>
        </div>

        {/* Business cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 my-4">
          {businessCards.map((businessCard) => (
            <div
              key={businessCard.code}
              className="bg-white rounded-md shadow cursor-pointer hover:shadow-lg transition duration-250 overflow-hidden"
              onClick={() => { router.push(`/cards/${businessCard.code}`) }}>
              <div className="w-100 bg-cover bg-center relative h-40" style={{backgroundImage: `url('${businessCard.front_image_url}')`}} ></div> {/* Front image */}
              <div className="px-4 py-3 border-bottom">
                <div>
                  <span className="text-sm font-semibold">{businessCard.last_name} {businessCard.first_name}</span> {/* Name */}
                </div>
                <div className="text-xs text-muted-foreground">{businessCard.company}</div> {/* Company */}
                <div className="text-xs text-muted-foreground">{businessCard.email}</div> {/* Email */}
                <div className="text-xs text-muted-foreground">{businessCard.mobile_phone}</div> {/* Mobile Phone */}

                {/* Tags */}
                { businessCard.tags.length > 0 &&
                  <div className="mt-4 flex flex-wrap gap-1">
                    {businessCard.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        className="text-xs"
                        style={{ backgroundColor: tag.color, color: "white" }}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                }
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="pt-8 pb-16">
          <Pagination
            paginationInfo={paginationInfo}
            onChangePage={onChangePage}
          />
        </div>
      </div>
    </main>
  )
}

export default withAuth(Cards)
