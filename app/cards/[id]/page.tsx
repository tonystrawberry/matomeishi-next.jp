"use client"; // This is a client component 👈🏽

import Header from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { BusinessCard } from "@/types/BusinessCard";
import React, { useState, useEffect, use } from "react";
import * as z from "zod";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  name: z.string().min(1).max(256),
  email: z.string().email(),
  phone: z.string().min(1).max(256),
  tags: z.array(z.object({ name: z.string().min(1).max(256) })).optional(),
});

export default function Card() {
  const router = useRouter();

  const [businessCard, setBusinessCard] = useState<BusinessCard>();
  const [mainImage, setMainImage] = useState<string>("front");
  const [customTag, setCustomTag] = useState<string>("");

  // TODO: uncomment when backend is ready
  // useEffect(() => {
  //   // Function to fetch business cards from API
  //   const fetchBusinessCard = async () => {
  //     try {
  //       const response = await fetch("https://api.example.com/business-cards"); // Replace with your actual API endpoint
  //       const data = await response.json();
  //       setBusinessCard(data);
  //     } catch (error) {
  //       console.error("Error fetching business cards:", error);
  //     }
  //   };

  //   // Call the fetch function
  //   fetchBusinessCard();
  // }, []); // Empty dependency array ensures this effect runs once on component mount

  useEffect(() => {
    setBusinessCard({
      name: "John Doe",
      email: "john_doe@gmail.com",
      frontImageUrl: "https://fakeimg.pl/600x500",
      backImageUrl: "https://fakeimg.pl/600x400",
      phone: "1234567890",
      tags: [{ name: "tag1" }, { name: "tag2" }, { name: "tag3" }],
    });
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      tags: [],
    },
  });

  const { fields, append, remove} = useFieldArray({
    name: "tags",
    control: form.control,
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }

  const addCustomTag = () => {
    setCustomTag("");

    if (customTag === "") return;
    if (fields.some((field) => field.name === customTag)) return;

    append({name: customTag});
  }

  const addTag = (tag: string) => {
    if (fields.some((field) => field.name === tag)) return;

    append({name: tag});
  }

  const removeTag = (tag: string) => () => {
    remove(fields.findIndex((field) => field.name === tag));
  }

  return (
    <main>
      <Header />

      <div className="container mx-auto max-w-screen-lg p-4">
        <Button variant="secondary" onClick={() => {router.push('/cards')}}>Back</Button>

        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2">
            <div className="w-full  py-4 pr-4 grid gap-4">
              <div>
                {mainImage === "front" && (
                  <img
                    className="h-auto max-w-full rounded-lg"
                    src={businessCard?.frontImageUrl}
                    alt=""
                  />
                )}

                {mainImage === "back" && (
                  <img
                    className="h-auto max-w-full rounded-lg"
                    src={businessCard?.backImageUrl}
                    alt=""
                  />
                )}
              </div>
              <div className="grid grid-cols-5 gap-4">
                <div>
                  {mainImage === "front" && (
                    <img
                      className="h-auto max-w-full rounded-lg cursor-pointer"
                      src={businessCard?.backImageUrl}
                      alt=""
                      onClick={() => setMainImage("back")}
                    />
                  )}

                  {mainImage === "back" && (
                    <img
                      className="h-auto max-w-full rounded-lg cursor-pointer"
                      src={businessCard?.frontImageUrl}
                      alt=""
                      onClick={() => setMainImage("front")}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/2 py-4 pl-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
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
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="08094074800" {...field} />
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
                          control={form.control}
                          key={field.id}
                          name={`tags.${index}`}
                          render={({ field }) => (
                            <FormItem>
                              <Badge className="cursor-pointer" onClick={removeTag(field.value.name)}>{field.value.name}</Badge>
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
                      <div className="flex gap-1 mb-4">
                        <Badge
                          className={fields.some((field) => field.name === "tag1") ? "cursor-default" : "cursor-pointer"}
                          variant={fields.some((field) => field.name === "tag1") ? "outline" : "default"}
                          onClick={() => addTag("tag1")}
                        >
                          tag1
                        </Badge>
                        <Badge
                          className={fields.some((field) => field.name === "tag2") ? "cursor-default" : "cursor-pointer"}
                          variant={fields.some((field) => field.name === "tag2") ? "outline" : "default"}
                          onClick={() => addTag("tag2")}
                        >
                          tag2
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Input placeholder="Custom Tag" className="w-full" value={customTag} onChange={(e) => setCustomTag(e.target.value) }/>
                        <Button type="submit" onClick={addCustomTag}>Add</Button>
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
