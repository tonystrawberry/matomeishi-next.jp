"use client"; // This is a client component 👈🏽

// URL: /tags/[id]
// This page shows the details of a tag.
// The user can edit the tag details and delete the tag.

import Header from "@/components/header";
import './styles.css'

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
import {
  BusinessCard,
  GetBusinessCardResponse,
  GetTagResponse,
  Tag as TagType,
} from "@/types/BusinessCard";
import React, { useState, useEffect, useContext } from "react";
import * as z from "zod";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRouter, useParams } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { toast, useToast } from "@/components/ui/use-toast";
import { AuthContext } from "../../../contexts/authContext";
import withAuth from "@/components/withAuth";
import { User } from "firebase/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  AtSign,
  Building2,
  CalendarDays,
  CalendarIcon,
  Phone,
  PlusCircle,
  Printer,
  ScrollText,
  Smartphone,
  UserCircle,
  Tag as TagIcon,
  Pyramid,
  AppWindow,
  GraduationCap,
  Home,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HexColorPicker } from "react-colorful";

// The form schema contains the validation rules for the form (using Zod)
const formSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().optional(),
  color: z.string().optional(),
});

export function Tag() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const { user } = useContext(AuthContext) as { user: User };

  const [tag, setTag] = useState<TagType | null>(null); // Tag details

  // Form data (react-hook-form)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: undefined,
      description: undefined,
      color: undefined,
    },
  });

  useEffect(() => {
    // Fetch the tag details
    fetchTag(id);
  }, []);

    // Set the form data (react-hook-form) when the tag object is fetched
    useEffect(() => {
      form.setValue("name", tag?.name ?? "")
      form.setValue("description", tag?.description ?? undefined)
      form.setValue("color", tag?.color ?? undefined)
    }, [form, tag])

  /***** Functions *****/

  // Fetch the tag details from the server
  // This function is called when the page is loaded
  const fetchTag = async (id: string) => {
    try {
      const firebaseToken = await user.getIdToken(); // Get the Firebase access token
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_API_URL}/tags/${id}`,
        { headers: { "x-firebase-token": firebaseToken } }
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch the tag | ${response.status}`, )
      }

      const data = (await response.json()) as GetTagResponse;

      const tag = data.data.attributes;

      setTag(tag);
    } catch (error) {
      console.error("[matomeishi]", error);

      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with our server.",
      });

      setTag(null);
    }
  };

  // Function to submit the form data and update the tag
  // Called when the user clicks the "Update" button
  const onSubmitValid = async (values: z.infer<typeof formSchema>) => {
    try {
      const firebaseToken = await user.getIdToken();

      const body = JSON.stringify({
        name: values.name,
        description: values.description,
        color: values.color,
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_API_URL}/tags/${id}`,
        {
          method: "PUT",
          body: body,
          headers: {
            "x-firebase-token": firebaseToken,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update the tag | ${response.status}`, )
      }

      await response.json();

      setTag(null);
      form.reset(); // Reset the form (react-hook-form)

      // Refetch the business card to update the business card page
      fetchTag(id as string);

      toast({
        title: "We updated your tag.",
        description: "The new information is now used.",
      });
    } catch (error) {
      console.error("[matomeishi]", error);

      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with our server.",
      });
    }
  };

  // Function to show an error message when the form data is invalid
  // Called when the user clicks the "Update" button
  const onSubmitInvalid = (errors: any) => {
    console.error("[matomeishi]", errors);

    toast({
      variant: "destructive",
      title: "Some fields are invalid.",
      description: "Please check the form and try again.",
    });
  };


  // Function to remove a business card
  // Called when the user clicks the "Delete" button
  const onClickDeleteTag = async () => {
    try {
      const firebaseToken = await user.getIdToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_API_URL}/tags/${id}`,
      {
        method: "DELETE",
        headers: { "x-firebase-token": firebaseToken }
      })

      if (!response.ok) {
        throw new Error(`Failed to delete the tag | ${response.status}`, )
      }

      toast({
        title: "We deleted your tag.",
        description: "The tag is no longer available and has been detached from your business cards.",
      })

      router.push("/tags")
    } catch (error) {
      console.error("[matomeishi]", error)

      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with our server.",
      })
    }
  }

  // Function to set the color of the tag
  // Called when the user changes the color
  const setColor = (color: string) => {
    form.setValue("color", color)

    if (tag) {
      tag.color = color
      setTag(tag)
    }
  }

  return tag ? (
    <main>
      <Header />

      <div className="container mx-auto max-w-screen-lg p-4 pb-32">
        <Button
          variant="secondary"
          onClick={() => {
            router.push("/cards");
          }}
        >
          Back
        </Button>

        <Separator className="my-4" />

        <div className="flex items-center">
          <TagIcon className="mr-2 h-6 w-6" />
          <h1 className="text-2xl font-semibold">{tag.name}</h1>
        </div>

        <p className="text-sm text-muted-foreground">
          Used in {tag.business_cards_count} business cards
        </p>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmitValid, onSubmitInvalid)}
            className="my-8 space-y-3"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="flex items-center gap-2 relative">
                    <UserCircle className="w-4 h-4" />
                    Name
                    <Badge
                      variant="destructive"
                      className="absolute right-0 rounded text-xs ml-1"
                    >
                      Required
                    </Badge>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="urgent" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="flex items-center gap-2 relative">
                    <UserCircle className="w-4 h-4" />
                    Description
                  </FormLabel>
                  <FormControl>
                  <Textarea placeholder="..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="flex items-center gap-2">
                    <UserCircle className="w-4 h-4" />
                    Color

                    <Badge className="ml-2" style={{ backgroundColor: tag.color }}>
                      preview
                    </Badge>
                  </FormLabel>
                  <FormControl>
                    <>
                    <HexColorPicker color={tag.color} onChange={setColor}  />
                    <Input placeholder="#000000" {...field} />
                    </>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator className="my-4" />

            <div className="flex justify-center">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" type="button">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      Are you sure?
                    </DialogTitle>
                    <DialogDescription>
                      You are about to delete this tag. It will be removed from all your business cards.
                      This action
                      cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="destructive"
                      type="button"
                      onClick={onClickDeleteTag}
                    >
                      Permanently Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button className="ml-auto" type="submit">
                Update
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </main>
  ) : (
    <Skeleton />
  );
}

export default withAuth(Tag);
