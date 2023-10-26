"use client"; // This is a client component 👈🏽

import Image from "next/image";

import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import React, { useState, useEffect, use, ChangeEvent, useContext } from "react";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/app/authContext";

const formSchema = z.object({
  name: z.string().min(1).max(256),
  email: z.string().email(),
  phone: z.string().min(1).max(256),
  tags: z.array(z.object({ name: z.string().min(1).max(256) })).optional(),
});

export default function Card() {
  const router = useRouter();
  const { user, loading } = useContext(AuthContext);

  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState<boolean>(false);

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

  const handleUploadImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "front" | "back"
  ) => {
    if (!e.target.files) {
      return;
    }

    console.log(e.target.className);

    console.log("e.target.files", e.target.files);
    if (type === "front") {
      setFrontImage(e.target.files[0]);
    } else if (type === "back") {
      setBackImage(e.target.files[0]);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData();
    formData.set("front_image", frontImage as Blob);
    formData.set("back_image", backImage as Blob);

    if (!user) {
      return;
    }

    setAnalyzing(true)
    const firebaseToken = await user.getIdToken();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_API_URL}/business_cards`,
      {
        method: "POST",
        body: formData,
        headers: { "x-firebase-token": firebaseToken }
      }
    );

    const data = await response.json();

    console.log("data", data);

    setAnalyzing(false)
    router.push(`/cards/${data.data.attributes.code}`);
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

        {/* Upload front image of business card */}
        <form onSubmit={onSubmit}>
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 py-4 pl-4">
              <div>
                <Label htmlFor="picture">Front Image</Label>
                <input
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                  id="file_input"
                  type="file"
                  onChange={(e) => {
                    handleUploadImage(e, "front");
                  }}
                />
              </div>
              {/* Show preview of uploaded front image */}
              <Image
                src={frontImage ? URL.createObjectURL(frontImage) : "/placeholder.png"}
                width={500}
                height={300}
                alt="Front image"
              />
            </div>

            {/* Upload back image of business card */}
            <div className="w-full md:w-1/2 py-4 pl-4">
              <div>
                <Label htmlFor="picture">Back Image</Label>
                <input
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                  id="file_input"
                  type="file"
                  onChange={(e) => {
                    handleUploadImage(e, "back");
                  }}
                />
              </div>
              <Image
                src={backImage ? URL.createObjectURL(backImage) : "/placeholder.png"}
                width={500}
                height={300}
                alt="Front image"
              />
            </div>
          </div>
          {/* Submit button */}
          <div className="w-full">
            <Button>
              { analyzing &&
                <svg aria-hidden="true" className="inline w-4 h-4 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-white" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                  <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                </svg>
              }
              Add & Analyze</Button>
          </div>
        </form>
      </div>
    </main>
  );
}
