"use client"; // This is a client component 👈🏽

import Header from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { BusinessCard, Tag } from "@/types/BusinessCard";
import React, { useState, useEffect, use, useContext } from "react";
import * as z from "zod";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { AuthContext } from "../../authContext"

const formSchema = z.object({
  company: z.string().min(1).max(256),
  email: z.string().email(),
  fax: z.string().min(1).max(256),
  first_name: z.string().min(1).max(256),
  home_phone: z.string().min(1).max(256),
  last_name: z.string().min(1).max(256),
  meeting_date: z.date(),
  mobile_phone: z.string().min(1).max(256),
  notes: z.string().min(1).max(256),
  tags: z.array(z.object({ tagId: z.number().optional(), name: z.string().min(1).max(256) })),
});

export default function Card() {
  const router = useRouter();
  const { toast } = useToast()

  const { user, loading } = useContext(AuthContext);
  const [loaded, setLoaded] = useState<boolean>(false);

  const { id } = useParams();

  const [businessCard, setBusinessCard] = useState<BusinessCard>();
  const [mainImage, setMainImage] = useState<string>("front");
  const [customTag, setCustomTag] = useState<string>("");
  const [tags, setTags] = useState<any[]>([]);

  useEffect(() => {
    console.log("useEffect")
    if (!loading) {
      if (!user) {
        // redirect to login page
        router.push("/");
        return;
      }

      if (loaded) {
        return;
      }

      console.log("loaded", loaded)

      setLoaded(true);
      // Get business card code from URL path
      fetchBusinessCard(id as string);
      fetchTags();
    }
  }, [loading]); // Empty dependency array ensures this effect runs once on component mount


  const fetchBusinessCard = async (id: string) => {
    try {
      form.reset()
      if (!user) {
        return;
      }

      const firebaseToken = await user.getIdToken();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_API_URL}/business_cards/${id}`,
        { headers: { "x-firebase-token": firebaseToken } }
      ); // Replace with your actual API endpoint
      const data = await response.json();

      console.log("data", data);

      const businessCard = data.data.attributes

      // Add the tags to the business cards
      const includedTags = data.included;
      const tagIds = data.data.relationships.tags.data.map((tag: any) => tag.id);
      const tags = includedTags.filter((tag: Tag) => tagIds.includes(tag.id));

      businessCard.tags = tags.map((tag: any) => tag.attributes);

      businessCard.tags.forEach((tag: any) => {
        append({ tagId: tag.id, name: tag.name });
      })

      setBusinessCard(businessCard);


    } catch (error) {
      console.error("Error fetching business cards:", error);
    }
  };

  // Function to fetch tags from API
  const fetchTags = async () => {
    try {
      if (!user) {
        return;
      }

      const firebaseToken = await user.getIdToken();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_API_URL}/tags`,
        { headers: { "x-firebase-token": firebaseToken } }
      ); // Replace with your actual API endpoint
      const data = await response.json();

      setTags(data.data.map((tag: any) => tag.attributes));
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company: "",
      email: "",
      fax: "",
      first_name: "",
      home_phone: "",
      last_name: "",
      meeting_date: new Date(),
      mobile_phone: "",
      notes: "",
      tags: [],
    },
  });

  // Set fields to business card infos
  useEffect(() => {
    form.setValue("company", businessCard?.company || "");
    form.setValue("email", businessCard?.email || "");
    form.setValue("fax", businessCard?.fax || "");
    form.setValue("first_name", businessCard?.first_name || "");
    form.setValue("home_phone", businessCard?.home_phone || "");
    form.setValue("last_name", businessCard?.last_name || "");
    form.setValue("meeting_date", businessCard?.meeting_date ? new Date(businessCard?.meeting_date) : new Date());
    form.setValue("mobile_phone", businessCard?.mobile_phone || "");
    form.setValue("notes", businessCard?.notes || "");
  }, [form, businessCard]);

  const { fields, append, remove } = useFieldArray({
    name: "tags",
    control: form.control,
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      return;
    }

    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
    console.log("SUBMIT");

    // Send the form data to the API
    const firebaseToken = await user.getIdToken();

    const body = JSON.stringify({
      company: values.company,
      email: values.email,
      fax: values.fax,
      first_name: values.first_name,
      home_phone: values.home_phone,
      last_name: values.last_name,
      meeting_date: values.meeting_date,
      mobile_phone: values.mobile_phone,
      notes: values.notes,
      tags: values.tags
    })

    console.log("body", body)

    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_API_URL}/business_cards/${id}`,
    {
      method: "PUT",
      body: body,
      headers: { "x-firebase-token": firebaseToken, "Content-Type": "application/json" }
    }); // Replace with your actual API endpoint

    const data = await response.json();

    console.log("data", data);
    toast({
      title: "✅ Updated succesfully."
    })

  };

  const addCustomTag = () => {
    setCustomTag("");

    if (customTag === "") return;
    if (fields.some((field) => field.name === customTag)) return;

    append({ name: customTag });
  };

  const addTag = (tag: any) => {
    if (fields.some((field) => field.tagId === tag.id)) return;

    append({ tagId: tag.id, name: tag.name });
  };

  const removeTag = (tag: { id?: string | undefined, name: string }) => () => {
    if (tag.id === undefined) {
      remove(fields.findIndex((field) => field.name == tag.name));
      return;
    }
    remove(fields.findIndex((field) => field.tagId == tag.id));
  };

  if (!businessCard){
    return <div>Loading...</div>
  }


  // バリデーション処理がNGの場合に呼ばれる関数
  const isInvalid = (errors: any) => {
    console.log(errors);
    console.log("Fail Login");
  };


  return (
    <main>
      <Header />

      <div className="container mx-auto max-w-screen-lg p-4">
        <Button
          variant="secondary"
          onClick={() => {
            router.push("/cards");
          }}
        >
          Back
        </Button>

        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2">
            <div className="w-full  py-4 pr-4 grid gap-4">
              <div>
                {mainImage === "front" && (
                  <Image
                    className="h-auto max-w-full rounded-lg"
                    src={businessCard.front_image_url || "/placeholder.png"}
                    alt=""
                    width={500}
                    height={300}
                  />
                )}

                {mainImage === "back" && (
                  <Image
                    className="h-auto max-w-full rounded-lg"
                    src={businessCard.back_image_url || "/placeholder.png"}
                    alt=""
                    width={500}
                    height={300}
                  />
                )}
              </div>
              <div className="grid grid-cols-5 gap-4">
                <div>
                  {mainImage === "front" && (
                    <Image
                      className="h-auto max-w-full rounded-lg cursor-pointer"
                      src={businessCard.back_image_url || "/placeholder.png"}
                      alt=""
                      onClick={() => setMainImage("back")}
                      width={500}
                      height={300}
                    />
                  )}

                  {mainImage === "back" && (
                    <Image
                      className="h-auto max-w-full rounded-lg cursor-pointer"
                      src={businessCard.front_image_url || "/placeholder.png"}
                      alt=""
                      onClick={() => setMainImage("front")}
                      width={500}
                      height={300}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/2 py-4 pl-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit, isInvalid)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last name</FormLabel>
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
                    <FormItem>
                      <FormLabel>First name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="john_doe@gmail.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="home_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Home Phone</FormLabel>
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
                    <FormItem>
                      <FormLabel>Mobile Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="08094074800" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fax</FormLabel>
                      <FormControl>
                        <Input placeholder="08094074800" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input placeholder="Monstarlab" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div>
                  <Popover>
                    <FormLabel>Tags</FormLabel>

                    <div className="flex flex-wrap gap-1 my-2">
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
                        Add Tag
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="flex flex-wrap gap-1 mb-4">
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
                          Add
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <Button type="submit">Update</Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </main>
  );
}
