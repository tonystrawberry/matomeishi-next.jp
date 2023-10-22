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

  return (
    <main>
      <Header />

      <div className="container mx-auto max-w-screen-lg p-4">
        <Button variant="secondary" onClick={() => {router.push('/cards')}}>Back</Button>

      </div>
    </main>
  );
}
