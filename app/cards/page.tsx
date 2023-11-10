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
import { AppWindow, AtSign, Building2, CalendarDays, Ear, FileSpreadsheet, GraduationCap, Home, Palmtree, Phone, PlusCircle, Printer, Pyramid, ScrollText, SlidersHorizontal, Smartphone, UserCircle, View, WalletCards } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { DateRange } from "react-day-picker"
import format from "date-format"
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet"

// This is the type of the search tags that are displayed below the search bar
type SearchTag = Tag & { selected: boolean }

function Cards() {
  const router = useRouter() // This is a hook that gives us access to the router
  const searchParams = useSearchParams() // This is a hook that returns the query string params

  const { user } = useContext(AuthContext) as { user: User }

  const [businessCards, setBusinessCards] = useState<BusinessCard[] | null>([]) // Corresponds to the list of business cards fetched from the API
  const [search, setSearch] = useState<string>("") // Corresponds to the user input in the search bar
  const [searchTags, setSearchTags] = useState<SearchTag[]>([]) // Corresponds to the tags that are displayed below the search bar
  const [params, setParams] = useState<URLSearchParams>(new URLSearchParams()) // Corresponds to the params that we will use to fetch data
  const [isLoadingCsv, setIsLoadingCsv] = useState<boolean>(false) // isLoadingCsv is true when the user clicks the "Export as CSV" button
  const [isLoadingBusinessCards, setIsLoadingBusinessCards] = useState<boolean>(true) // isLoading is true when we are fetching business cards from the API
  const [meetingDatesRange, setMeetingDatesRange] = useState<DateRange | undefined>({ from: undefined, to: undefined}) // Corresponds to the range of meeting dates selected by the user

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
    const meetingDateFrom = searchParams.get('meeting_date_from')
    const meetingDateTo = searchParams.get('meeting_date_to')

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

    // Set meeting date from if it is not null
    if (meetingDateFrom) {
      newParams.set("meeting_date_from", meetingDateFrom)
    }

    // Set meeting date to if it is not null
    if (meetingDateTo) {
      newParams.set("meeting_date_to", meetingDateTo)
    }

    setMeetingDatesRange({
      from: meetingDateFrom ? new Date(meetingDateFrom) : undefined,
      to: meetingDateTo ? new Date(meetingDateTo) : undefined,
    }) // Set the meeting dates range to the query string
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
      setBusinessCards(null)
      setIsLoadingBusinessCards(true)
      const firebaseToken = await user.getIdToken() // Get the Firebase access token
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_API_URL}/business_cards?${params.toString()}`, { headers: { "x-firebase-token": firebaseToken }})
      setIsLoadingBusinessCards(false)

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

  // Callback function for when the meeting dates range is changed
  // Called when we select a range of dates in the calendar
  // This function will change the query string (also params state) and call fetchBusinessCards()
  const onChangeMeetingDatesRange = async (meetingDatesRange: DateRange | undefined) => {
    const copiedParams = new URLSearchParams(params) // Copy the params

    // Reset page to 1 if meeting dates range is changed
    copiedParams.set("page", "1")

    console.log(meetingDatesRange)

    // Add meeting dates range to params if it is not null
    if (meetingDatesRange?.from) {
      copiedParams.set("meeting_date_from", format.asString('yyyy-MM-dd', meetingDatesRange.from))
    } else {
      copiedParams.delete('meeting_date_from')
    }

    if (meetingDatesRange?.to) {
      copiedParams.set("meeting_date_to", format.asString('yyyy-MM-dd', meetingDatesRange.to))
    } else {
      copiedParams.delete('meeting_date_to')
    }

    setParams(copiedParams) // Set the params state with the new meeting dates range
    setMeetingDatesRange(meetingDatesRange) // Set the meeting dates range state with the new meeting dates range

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

  // Callback function for when the "Quick View" button is clicked
  // Called when we click on the "Quick View" button
  // This function will open the quick view modal and display all the information about the business card
  const showQuickView = (event: React.MouseEvent<HTMLDivElement, MouseEvent>, code: string) => {
    event.stopPropagation()
  }

  return (
    <main>
      <Header />

      <div className="container mx-auto max-w-screen-lg p-4">
        <div className="flex items-center mb-4">
          <WalletCards className="mr-2 h-6 w-6" />
          <h1 className="text-2xl font-semibold">Gallery</h1>

          {/* Export CSV button */}
          <Button className="ml-auto" onClick={onClickExportCsv} disabled={isLoadingCsv}><FileSpreadsheet className="w-4 h-4 mr-2" />Export as CSV</Button>
        </div>

        <div className="flex">
          {/* Search bar */}
          <Input
            placeholder="Search..."
            className="w-full"
            value={search}
            onChange={(e) => onChangeQ(e.target.value)}
          />

          <Popover>
            <PopoverTrigger>
              <Button className="ml-2">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                <h4 className="font-medium leading-none">Meeting date</h4>
                  <p className="text-xs text-muted-foreground">
                    Select the range of meeting dates
                  </p>

                  <Calendar
                    mode="range"
                    defaultMonth={new Date()}
                    selected={meetingDatesRange}
                    onSelect={onChangeMeetingDatesRange}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

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
          {businessCards && businessCards.map((businessCard) => (
            <div
              key={businessCard.code}
              className="bg-white rounded-md shadow cursor-pointer hover:shadow-lg transition duration-250 overflow-hidden relative"
              onClick={() => { router.push(`/cards/${businessCard.code}`) }}>
              <div className="w-100 bg-cover bg-center relative h-40" style={{backgroundImage: `url('${businessCard.front_image_url}')`}} ></div> {/* Front image */}
              <div className="px-4 py-3 border-bottom">
                <div>
                  <span className="text-sm font-semibold">{businessCard.last_name} {businessCard.first_name}</span> {/* Name */}
                </div>
                <div className="text-xs text-muted-foreground">{businessCard.company}</div> {/* Company */}
                <div className="text-xs text-muted-foreground">{businessCard.email}</div> {/* Email */}

                <div onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => { showQuickView(e, businessCard.code) }}>
                  <Sheet>
                    <SheetTrigger asChild>
                      <div className="absolute top-2 right-2">
                        <div className="w-8 h-8 bg-white opacity-80 hover:opacity-100 rounded-full flex justify-center items-center cursor-pointer">
                          <View className="w-4 h-4" />
                        </div>
                      </div>
                    </SheetTrigger>
                    <SheetContent className="w-[400px]">
                      <SheetHeader>
                        <SheetTitle>{businessCard.last_name} {businessCard.first_name}</SheetTitle>
                      </SheetHeader>
                      <div className="grid gap-2 py-4">
                        <div className="grid grid-cols-12 items-center gap-4">
                          <div className="text-sm font-medium flex gap-2 col-span-5 "><UserCircle className="w-4 h-4" />Last name</div>
                          <div className="col-span-7 text-right text-sm">{businessCard.last_name}</div>
                        </div>
                        <div className="grid grid-cols-12 items-center gap-4">
                          <div className="text-sm font-medium flex gap-2 col-span-5"><UserCircle className="w-4 h-4" />First name</div>
                          <div className="col-span-7 text-right text-sm">{businessCard.first_name}</div>
                        </div>
                        <div className="grid grid-cols-12 items-center gap-4">
                          <div className="text-sm font-medium flex gap-2 col-span-5"><Ear className="w-6 h-6" />Last name (Phonetic)</div>
                          <div className="col-span-7 text-right text-sm">{businessCard.last_name_phonetic}</div>
                        </div>
                        <div className="grid grid-cols-12 items-center gap-4">
                          <div className="text-sm font-medium flex gap-2 col-span-5"><Ear className="w-6 h-6" />First name (Phonetic)</div>
                          <div className="col-span-7 text-right text-sm">{businessCard.first_name_phonetic}</div>
                        </div>
                        <div className="grid grid-cols-12 items-center gap-4">
                          <div className="text-sm font-medium flex gap-2 col-span-5"><Building2 className="w-4 h-4" />Company</div>
                          <div className="col-span-7 text-right text-sm">{businessCard.company}</div>
                        </div>
                        <div className="grid grid-cols-12 items-center gap-4">
                          <div className="text-sm font-medium flex gap-2 col-span-5"><Pyramid className="w-4 h-4" />Department</div>
                          <div className="col-span-7 text-right text-sm">{businessCard.department}</div>
                        </div>
                        <div className="grid grid-cols-12 items-center gap-4">
                          <div className="text-sm font-medium flex gap-2 col-span-5"><GraduationCap className="w-4 h-4" />Job Title</div>
                          <div className="col-span-7 text-right text-sm">{businessCard.job_title}</div>
                        </div>
                        <div className="grid grid-cols-12 items-center gap-4">
                          <div className="text-sm font-medium flex gap-2 col-span-5"><AppWindow className="w-4 h-4" />Website</div>
                          <div className="col-span-7 text-right text-sm">{businessCard.website}</div>
                        </div>
                        <div className="grid grid-cols-12 items-center gap-4">
                          <div className="text-sm font-medium flex gap-2 col-span-5"><Home className="w-4 h-4" />Address</div>
                          <div className="col-span-7 text-right text-sm">{businessCard.address}</div>
                        </div>
                        <div className="grid grid-cols-12 items-center gap-4">
                          <div className="text-sm font-medium flex gap-2 col-span-5"><AtSign className="w-4 h-4" />Email</div>
                          <div className="col-span-7 text-right text-sm">{businessCard.email}</div>
                        </div>
                        <div className="grid grid-cols-12 items-center gap-4">
                          <div className="text-sm font-medium flex gap-2 col-span-5"><Phone className="w-4 h-4" />Home Phone</div>
                          <div className="col-span-7 text-right text-sm">{businessCard.home_phone}</div>
                        </div>
                        <div className="grid grid-cols-12 items-center gap-4">
                          <div className="text-sm font-medium flex gap-2 col-span-5"><Smartphone className="w-4 h-4" />Mobile Phone</div>
                          <div className="col-span-7 text-right text-sm">{businessCard.mobile_phone}</div>
                        </div>
                        <div className="grid grid-cols-12 items-center gap-4">
                          <div className="text-sm font-medium flex gap-2 col-span-5"><Printer className="w-4 h-4" />Fax</div>
                          <div className="col-span-7 text-right text-sm">{businessCard.fax}</div>
                        </div>
                        <div className="grid grid-cols-12 items-center gap-4">
                          <div className="text-sm font-medium flex gap-2 col-span-5"><CalendarDays className="w-4 h-4" />Meeting Date</div>
                          <div className="col-span-7 text-right text-sm">{businessCard.meeting_date}</div>
                        </div>
                        <div className="grid grid-cols-12 items-center gap-4">
                          <div className="text-sm font-medium flex gap-2 col-span-5"><ScrollText className="w-4 h-4" />Notes</div>
                          <div className="col-span-7 text-right text-sm">{businessCard.notes}</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        { businessCard.tags.map((tag) => (
                          <Badge
                            key={tag.id}
                            style={{ backgroundColor: tag.color, color: "white" }}
                          > { tag.name }
                          </Badge>
                        ))}
                      </div>
                      <SheetFooter>
                        <SheetClose asChild>
                          <Button>Close</Button>
                        </SheetClose>
                      </SheetFooter>
                    </SheetContent>
                  </Sheet>
                </div>

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

          {/* No business cards */}
          {businessCards && businessCards.length === 0 &&
            <div className="col-span-full flex flex-col items-center justify-center">
              <div className="text-xl font-semibold mb-2">
                No business cards found 🥲
              </div>
              <div className="text-muted-foreground mb-4">Try changing your search query or filters</div>

              <Button onClick={() => { router.push("/cards/new")}}>
                <PlusCircle className="w-4 h-4 mr-2" />
                <span>Business Card</span>
              </Button>
            </div>
          }

          {/* Loading */}
          {isLoadingBusinessCards &&
            <div className="col-span-full flex flex-col items-center justify-center">
              <div className="animate-pulse w-32 h-32 bg-black rounded-full flex justify-center items-center text-white">
                <Palmtree className="w-16 h-16"/>
              </div>
            </div>
          }
        </div>

        {/* Pagination (only when there is some business cards */}
        { businessCards && businessCards.length !== 0 &&
          <div className="pt-8 pb-16">
            <Pagination
              paginationInfo={paginationInfo}
              onChangePage={onChangePage}
            />
          </div>
        }
      </div>
    </main>
  )
}

export default withAuth(Cards)
