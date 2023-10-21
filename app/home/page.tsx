"use client"; // This is a client component 👈🏽

import Header from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BusinessCard from "@/types/BusinessCard";
import React, { useState, useEffect, use } from "react";

export default function Home() {
  const [businessCards, setBusinessCards] = useState<BusinessCard[]>([]);

  // TODO: uncomment when backend is ready
  // useEffect(() => {
  //   // Function to fetch business cards from API
  //   const fetchBusinessCards = async () => {
  //     try {
  //       const response = await fetch("https://api.example.com/business-cards"); // Replace with your actual API endpoint
  //       const data = await response.json();
  //       setBusinessCards(data);
  //     } catch (error) {
  //       console.error("Error fetching business cards:", error);
  //     }
  //   };

  //   // Call the fetch function
  //   fetchBusinessCards();
  // }, []); // Empty dependency array ensures this effect runs once on component mount

  useEffect(() => {
    setBusinessCards([
      {
        name: "John Doe",
        email: "john_doe@gmail.com",
        frontImageUrl: "https://fakeimg.pl/600x400",
        backImageUrl: "https://fakeimg.pl/600x400",
        phone: "1234567890",
      },
      {
        name: "Jane Doe",
        email: "jane_doe@gmail.com",
        frontImageUrl: "https://fakeimg.pl/600x400",
        backImageUrl: "https://fakeimg.pl/600x400",
        phone: "1234567890",
      },
      {
        name: "John Smith",
        email: "john_smith@gmail.com",
        frontImageUrl: "https://fakeimg.pl/600x400",
        backImageUrl: "https://fakeimg.pl/600x400",
        phone: "1234567890",
      },{
        name: "John Doe",
        email: "john_doe@gmail.com",
        frontImageUrl: "https://fakeimg.pl/600x400",
        backImageUrl: "https://fakeimg.pl/600x400",
        phone: "1234567890",
      },
      {
        name: "Jane Doe",
        email: "jane_doe@gmail.com",
        frontImageUrl: "https://fakeimg.pl/600x400",
        backImageUrl: "https://fakeimg.pl/600x400",
        phone: "1234567890",
      },
      {
        name: "John Smith",
        email: "john_smith@gmail.com",
        frontImageUrl: "https://fakeimg.pl/600x400",
        backImageUrl: "https://fakeimg.pl/600x400",
        phone: "1234567890",
      },
    ]);
  }, []);

  return (
    <main>
      <Header />

      <div className="container mx-auto max-w-screen-lg p-4">

        <Input placeholder="Search..." className="w-full" />

        <div className="p-4">
          <div className="flex gap-1">
            <Badge className="cursor-pointer">Primary</Badge>
            <Badge className="cursor-pointer">Secondary</Badge>
            <Badge className="cursor-pointer" variant="outline">Tertiary</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 my-4">
          {businessCards.map((card, index) => (
            <div key={index} className="bg-white rounded shadow">
              <div>
                <img src={card.frontImageUrl} alt="Front of business card" />
              </div>
              <div className="p-4 border-bottom">
                <div>
                  <span className="font-semibold">{card.name}</span>
                </div>
                <p>{card.email}</p>
                <p>{card.phone}</p>

                <div className="mt-4 flex gap-1">
                  <Badge>Primary</Badge>
                  <Badge>Secondary</Badge>
                </div>
              </div>
              <div className="p-4">
                <Button className="w-full">View</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
