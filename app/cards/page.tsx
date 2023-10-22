"use client"; // This is a client component 👈🏽

import Header from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BusinessCard, Tag } from "@/types/BusinessCard";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, use } from "react";

type SearchTag = Tag & { selected: boolean };

export default function Cards() {
  const router = useRouter();

  const [businessCards, setBusinessCards] = useState<BusinessCard[]>([]);
  const [search, setSearch] = useState<string>("");
  const [searchTags, setSearchTags] = useState<SearchTag[]>([]);

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
        tags: [{ name: "tag1" }, { name: "tag2" }, { name: "tag3" }],
      },
      {
        name: "Jane Doe",
        email: "jane_doe@gmail.com",
        frontImageUrl: "https://fakeimg.pl/600x400",
        backImageUrl: "https://fakeimg.pl/600x400",
        phone: "1234567890",
        tags: [{ name: "tag1" }, { name: "tag2" }, { name: "tag3" }],
      },
      {
        name: "John Smith",
        email: "john_smith@gmail.com",
        frontImageUrl: "https://fakeimg.pl/600x400",
        backImageUrl: "https://fakeimg.pl/600x400",
        phone: "1234567890",
        tags: [{ name: "tag1" }, { name: "tag2" }, { name: "tag3" }],
      },
      {
        name: "John Doe",
        email: "john_doe@gmail.com",
        frontImageUrl: "https://fakeimg.pl/600x400",
        backImageUrl: "https://fakeimg.pl/600x400",
        phone: "1234567890",
        tags: [{ name: "tag1" }, { name: "tag2" }, { name: "tag3" }],
      },
      {
        name: "Jane Doe",
        email: "jane_doe@gmail.com",
        frontImageUrl: "https://fakeimg.pl/600x400",
        backImageUrl: "https://fakeimg.pl/600x400",
        phone: "1234567890",
        tags: [{ name: "tag1" }, { name: "tag2" }, { name: "tag3" }],
      },
      {
        name: "John Smith",
        email: "john_smith@gmail.com",
        frontImageUrl: "https://fakeimg.pl/600x400",
        backImageUrl: "https://fakeimg.pl/600x400",
        phone: "1234567890",
        tags: [{ name: "tag1" }, { name: "tag2" }, { name: "tag3" }],
      },
    ]);

    setSearchTags([
      {
        name: "tag1",
        selected: true
      },
      {
        name: "tag2",
        selected: true
      },
      {
        name: "tag3",
        selected: true
      },
    ]);
  }, []);

  const onClickSearchTag = (tag: SearchTag) => {
    const newSearchTags = searchTags.map((searchTag) => {
      if (searchTag.name === tag.name) {
        return {
          ...searchTag,
          selected: !searchTag.selected,
        };
      } else {
        return searchTag;
      }
    });

    setSearchTags(newSearchTags);
  }

  return (
    <main>
      <Header />

      <div className="container mx-auto max-w-screen-lg p-4">
        <Input
          placeholder="Search..."
          className="w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="p-4">
          <div className="flex gap-1">
            {searchTags.map((tag, index) => (
              <Badge
                key={index}
                onClick={(e) => onClickSearchTag(tag)}
                variant={tag.selected ? "default" : "outline"}
                className="cursor-pointer"
              >{tag.name}</Badge>
            ))}
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
                <div>{card.email}</div>
                <div>{card.phone}</div>

                <div className="mt-4 flex gap-1">
                  {card.tags.map((tag, index) => (
                    <Badge key={index}>{tag.name}</Badge>
                  ))}
                </div>
              </div>
              <div className="p-4">
                <Button
                  className="w-full"
                  onClick={() => {
                    router.push(`/cards/${index}`);
                  }}
                >
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
