"use client" // This is a client component 👈🏽

// URL: /cards/[id]
// This page shows the details of a business card.
// The user can edit the business card details here.

import Header from "@/components/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { BusinessCard, GetBusinessCardResponse, Tag } from "@/types/BusinessCard"
import React, { useState, useEffect, useContext } from "react"
import * as z from "zod"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useRouter, useParams } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { AuthContext } from "../../../contexts/authContext"
import withAuth from "@/components/withAuth"
import { User } from "firebase/auth"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { AtSign, Building2, CalendarDays, CalendarIcon, Phone, PlusCircle, Printer, ScrollText, Smartphone, UserCircle, Tag as TagIcon, Pyramid, AppWindow, GraduationCap, Home } from "lucide-react"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"


// The form schema contains the validation rules for the form (using Zod)
const formSchema = z.object({
  address: z.string().optional(),
  company: z.string().optional(),
  department: z.string().optional(),
  email: z.string().email().optional(),
  fax: z.string().optional(),
  first_name: z.string().min(1, { message: "" }), // The first name is required (min length = 1) but do not show an error message
  home_phone: z.string().optional(),
  job_title: z.string().optional(),
  last_name: z.string().optional(),
  meeting_date: z.date().optional(),
  mobile_phone: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.object({ tagId: z.number().optional(), name: z.string() })),
  website: z.string().url().optional().or(z.literal('')),
})

export function Card() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useContext(AuthContext) as { user: User }
  const { id } = useParams()

  const [businessCard, setBusinessCard] = useState<BusinessCard>() // Corresponds to the business card object
  const [customTag, setCustomTag] = useState<string>("") // Corresponds to the custom tag text input
  const [tags, setTags] = useState<Tag[]>([]) // Corresponds to the list of tags

  // Form data (react-hook-form)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: undefined,
      company: undefined,
      department: undefined,
      email: undefined,
      fax: undefined,
      first_name: undefined,
      home_phone: undefined,
      job_title: undefined,
      last_name: undefined,
      meeting_date: new Date(),
      mobile_phone: undefined,
      notes: undefined,
      tags: [],
      website: undefined,
    },
  })

  // Field array for tags only (react-hook-form)
  const { fields, append, remove } = useFieldArray({
    name: "tags",
    control: form.control,
  })

  useEffect(() => {
    fetchBusinessCard(id as string)
    fetchTags()
  }, []) // Empty dependency array ensures this effect runs once on component mount

  useEffect(() => {
    form.setValue("address", businessCard?.address ?? undefined)
    form.setValue("company", businessCard?.company ?? undefined)
    form.setValue("department", businessCard?.department ?? undefined)
    form.setValue("email", businessCard?.email ?? undefined)
    form.setValue("fax", businessCard?.fax ?? undefined)
    form.setValue("first_name", businessCard?.first_name ?? "")
    form.setValue("home_phone", businessCard?.home_phone ?? undefined)
    form.setValue("job_title", businessCard?.job_title ?? undefined)
    form.setValue("last_name", businessCard?.last_name ?? undefined)
    form.setValue("meeting_date", businessCard?.meeting_date ? new Date(businessCard?.meeting_date) : new Date())
    form.setValue("mobile_phone", businessCard?.mobile_phone ?? undefined)
    form.setValue("notes", businessCard?.notes ?? undefined)
    form.setValue("website", businessCard?.website ?? undefined)
  }, [form, businessCard])

  /***** Functions *****/

  // Function to fetch business card from API
  // The business card object is stored in the state variable `businessCard`
  // Called when the component is mounted
  const fetchBusinessCard = async (id: string) => {
    try {
      const firebaseToken = await user.getIdToken()
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_API_URL}/business_cards/${id}`,
        { headers: { "x-firebase-token": firebaseToken } }
      )
      const data = await response.json() as GetBusinessCardResponse

      const businessCard = data.data.attributes
      const includedTags = data.included

      // Get tags information from included tags
      // Inside relationships.tags.data, there is an array of tag IDs (e.g. [{id: 1}, {id: 2}])
      const tagIds = data.data.relationships.tags.data.map((tag) => tag.id)
      const tags = includedTags.filter((tag) => tagIds.includes(tag.id))

      // Append tags to the form (react-hook-form)
      tags.map((tag: any) => tag.attributes).forEach((tag: any) => {
        append({ tagId: tag.id, name: tag.name })
      })

      setBusinessCard(businessCard)
    } catch (error) {
      console.error("[matomeishi]", error)

      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with our server.",
      })

      router.push("/cards")
    }
  }

  // Function to fetch tags from API
  // The tags are stored in the state variable `tags`
  // They will be used for displaying all tags in the popover for adding/removing tags
  // Called when the component is mounted
  const fetchTags = async () => {
    try {
      const firebaseToken = await user.getIdToken()
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_API_URL}/tags`,
        { headers: { "x-firebase-token": firebaseToken } }
      )
      const data = await response.json()

      setTags(data.data.map((tag: any) => tag.attributes))
    } catch (error) {
      console.error("[matomeishi]", error)

      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with our server.",
      })

      router.push("/cards")
    }
  }

  // Function to submit the form data and update the business card
  // Called when the user clicks the "Update" button
  const onSubmitValid = async (values: z.infer<typeof formSchema>) => {
    try {
      const firebaseToken = await user.getIdToken()

      const body = JSON.stringify({
        address: values.address,
        company: values.company,
        department: values.department,
        email: values.email,
        fax: values.fax,
        first_name: values.first_name,
        home_phone: values.home_phone,
        job_title: values.job_title,
        last_name: values.last_name,
        meeting_date: values.meeting_date,
        mobile_phone: values.mobile_phone,
        notes: values.notes,
        tags: values.tags,
        website: values.website,
      })

      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_API_URL}/business_cards/${id}`,
      {
        method: "PUT",
        body: body,
        headers: { "x-firebase-token": firebaseToken, "Content-Type": "application/json" }
      })

      await response.json()

      setBusinessCard(undefined)
      form.reset() // Reset the form (react-hook-form)

      // Refetch the business card to update the business card page
      fetchBusinessCard(id as string)
      fetchTags()

      toast({
        title: "We updated your business card.",
        description: "The new information is now available on your business card page.",
      })
    } catch (error) {
      console.error("[matomeishi]", error)

      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with our server.",
      })
    }
  }

  // Function to show an error message when the form data is invalid
  // Called when the user clicks the "Update" button
  const onSubmitInvalid = (errors: any) => {
    console.error("[matomeishi]", errors)

    toast({
      variant: "destructive",
      title: "Some fields are invalid.",
      description: "Please check the form and try again.",
    })
  }

  // Function to add a custom tag to the form (react-hook-form)
  // Called when the user clicks the "+" button in the popover for adding a custom tag
  const addCustomTag = () => {
    if (customTag === "") return // Do nothing if the custom tag text input is empty

    setCustomTag("") // Clear the custom tag text input

    // Convert the custom tag to lowercase and replace spaces with underscores
    const formattedCustomtag = customTag.toLowerCase().replaceAll(" ", "_")
    if (fields.some((field) => field.name === formattedCustomtag)) return // Do nothing if the custom tag already exists

    append({ name: formattedCustomtag }) // Append the custom tag to the form (react-hook-form)
  }

  // Function to add a tag to the form (react-hook-form)
  // Called when the user clicks a tag in the popover for adding tags
  const addTag = (tag: { name: string; id?: number | undefined; }) => {
    if (fields.some((field) => field.tagId === tag.id)) return // Do nothing if the tag already exists

    append({ tagId: tag.id, name: tag.name }) // Append the tag to the form (react-hook-form)
  }

  // Function to remove a tag from the form (react-hook-form)
  // Called when the user clicks a tag in the form
  const removeTag = (tag: { name: string; id?: number | undefined; }) => () => {
    // If the tag is a custom tag, remove it from the form by name (react-hook-form)
    if (tag.id === undefined) {
      remove(fields.findIndex((field) => field.name == tag.name))
      return
    }

    // If the tag is not a custom tag, remove it from the form by ID (react-hook-form)
    remove(fields.findIndex((field) => field.tagId == tag.id))
  }

  return (
    <main>
      <Header />

      <div className="container mx-auto max-w-screen-lg p-4 pb-16">
        <div className="flex justify-center items-center relative">
          <Button
            className="absolute left-0"
            variant="secondary"
            onClick={() => {
              router.push("/cards")
            }}
          >
            Back
          </Button>
          <div>
            <div className="flex items-center">
              <UserCircle className="mr-2 h-6 w-6" />
              {businessCard ? <h1 className="text-2xl font-semibold">{businessCard?.last_name} {businessCard?.first_name}</h1> : <Skeleton className="w-40 h-6" />}
            </div>
            <h2 className="ml-2 text-muted-foreground">{businessCard?.company}</h2>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2">
            <div className="w-full py-4 pr-4 grid gap-4">
              <div>
              {
                    businessCard ?
                      <>

                        <div className="rounded-2xl overflow-hidden mb-4"><div className="bg-cover bg-center h-64" style={{backgroundImage: `url('${businessCard.front_image_url}')`}} ></div></div>
                        <div className="rounded-2xl overflow-hidden"><div className="bg-cover bg-center h-64" style={{backgroundImage: `url('${businessCard.back_image_url}')`}} ></div></div>
                      </>
                    :
                      <Skeleton className="w-full h-64" />
                   }

              </div>
            </div>
          </div>
          <div className="w-full md:w-1/2 py-4 p-4 md:pl-4 md:p-0 md:py-4">
            { businessCard ?
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmitValid, onSubmitInvalid)}
                  className="space-y-3"
                >
                  <div className="flex gap-2">
                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem className="w-1/2">
                          <FormLabel className="flex items-center gap-2"><UserCircle className="w-4 h-4" />Last name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem className="w-1/2">
                          <FormLabel className="flex items-center gap-2 relative"><UserCircle className="w-4 h-4" />First name <Badge variant="destructive" className="absolute right-0 rounded text-xs ml-1">Required</Badge></FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-2">
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem className="w-1/2">
                          <FormLabel className="flex items-center gap-2"><Building2 className="w-4 h-4" />Company</FormLabel>
                          <FormControl>
                            <Input placeholder="Monstarlab" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem className="w-1/2">
                          <FormLabel className="flex items-center gap-2"><Pyramid className="w-4 h-4" />Department</FormLabel>
                          <FormControl>
                            <Input placeholder="Human Resources" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-2">
                    <FormField
                      control={form.control}
                      name="job_title"
                      render={({ field }) => (
                        <FormItem className="w-1/2">
                          <FormLabel className="flex items-center gap-2"><GraduationCap className="w-4 h-4" />Job Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Chief Executive Officer" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem className="w-1/2">
                          <FormLabel className="flex items-center gap-2"><AppWindow className="w-4 h-4" />Website</FormLabel>
                          <FormControl>
                            <Input placeholder="https://monstar-lab.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><Home className="w-4 h-4" />Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Shibuya City, Tokyo, Japan" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="mt-2">
                        <FormLabel className="flex items-center gap-2"><AtSign className="w-4 h-4" />Email</FormLabel>
                        <FormControl>
                          <Input placeholder="john_doe@gmail.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2">
                    <FormField
                      control={form.control}
                      name="home_phone"
                      render={({ field }) => (
                        <FormItem className="w-1/2">
                          <FormLabel className="flex items-center gap-2"><Phone className="w-4 h-4" />Home Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="08094074800" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="mobile_phone"
                      render={({ field }) => (
                        <FormItem className="w-1/2">
                          <FormLabel className="flex items-center gap-2"><Smartphone className="w-4 h-4" />Mobile Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="08094074800" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex gap-2">
                    <FormField
                      control={form.control}
                      name="fax"
                      render={({ field }) => (
                        <FormItem className="w-1/2">
                          <FormLabel className="flex items-center gap-2"><Printer className="w-4 h-4" />Fax</FormLabel>
                          <FormControl>
                            <Input placeholder="08094074800" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="meeting_date"
                      render={({ field }) => (
                        <FormItem className="w-1/2">
                          <FormLabel className="flex items-center gap-2"><CalendarDays className="w-4 h-4" />Meeting Date</FormLabel>
                          <FormControl>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-[240px] pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date > new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><ScrollText className="w-4 h-4" />Notes</FormLabel>
                        <FormControl>
                          <Textarea placeholder="..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div>
                    <Popover>
                      <FormLabel className="flex items-center gap-2"><TagIcon className="w-4 h-4" />Tags</FormLabel>

                      <div className="flex flex-wrap gap-2 my-2">
                        {fields.map((field, index) => (
                          <FormField
                            key={field.tagId}
                            control={form.control}
                            name={`tags.${index}`}
                            render={({ field }) => (
                              <FormItem>
                                <Badge
                                  className="cursor-pointer"
                                  onClick={removeTag(field.value)}
                                >
                                  {field.value.name}
                                </Badge>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => {}}
                        >
                          <PlusCircle className="w-6 h-6" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="flex flex-wrap gap-2 mb-4">
                          { tags.map((tag) => (
                            <Badge
                              key={tag.id}
                              className={
                                fields.some((field) => field.tagId == tag.id)
                                  ? "cursor-default"
                                  : "cursor-pointer"
                              }
                              variant={
                                fields.some((field) => field.tagId == tag.id)
                                  ? "outline"
                                  : "default"
                              }
                              onClick={() => addTag(tag)}
                            >
                              { tag.name }
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Custom Tag"
                            className="w-full"
                            value={customTag}
                            onChange={(e) => setCustomTag(e.target.value)}
                          />
                          <Button type="button" onClick={addCustomTag}>
                            <PlusCircle />
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-center">
                    <Button type="submit">Update</Button>
                  </div>
                </form>
              </Form>
              :
              <Skeleton className="w-full h-64" />
            }
          </div>
        </div>
      </div>
    </main>
  )
}

export default withAuth(Card)
