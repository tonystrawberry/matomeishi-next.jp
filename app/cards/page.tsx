"use client"; // This is a client component 👈🏽

import Header from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BusinessCard, Tag } from "@/types/BusinessCard";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect, use, useContext } from "react";
import { AuthContext } from "../authContext"
import { Pagination, PaginationInfo } from "@/components/pagination";

type SearchTag = Tag & { selected: boolean };


interface BusinessCardResponse {
  attributes: BusinessCard;
  id: string;
  relationships: {
    tags: {
      data: TagResponse[]
    }
  };
  type: string
}

interface TagResponse {
  attributes: Tag;
  id: string;
  type: string;
}
interface BusinessCardsResponse {
  data: BusinessCardResponse[]
  included: (Tag)[]
}

export default function Cards() {
  const router = useRouter();
  const { user, loading } = useContext(AuthContext);

  const [businessCards, setBusinessCards] = useState<BusinessCardsResponse>({ data: [], included: []});
  const [search, setSearch] = useState<string>("");
  const [searchTags, setSearchTags] = useState<SearchTag[]>([]);

  const [paginationInfo, setPaginationInfo] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    isLastPage: true,
  });

  const [params, setParams] = useState<URLSearchParams>(new URLSearchParams());

  const searchParams = useSearchParams()

  useEffect(() => {
    if (!loading){
      if (!user) {
        // redirect to login page
        router.push("/");
        return;
      }

      // Get page number from URL
      let page = searchParams.get('page');
      let q = searchParams.get('q');
      let tags = searchParams.getAll('tags[]');

      console.log("tags", tags)

      const newParams = new URLSearchParams();

      // Set page if it is a number and not null
      if (page && !isNaN(Number(page))) {
        newParams.set("page", page as string);
      }

      // Set q if it is not null and not an empty string
      if (q && q !== "") {
        newParams.set("q", q as string);
      }

      tags.forEach((tag) => {
        newParams.append("tags[]", tag);
      })

      // Reload page without query string if page is not a number
      if (page && isNaN(Number(page))) {
        router.push("/cards");
        return;
      }

      setSearch(q as string);
      setParams(newParams)
    }
  }, [router, user, loading]); // Empty dependency array ensures this effect runs once on component mount

  useEffect(() => {
    fetchBusinessCards();
    fetchTags();
  }, [params]); // Reload data when params change

  // Function to fetch business cards from API
  const fetchBusinessCards = async () => {
    try {
      if (!user) {
        return;
      }

      const firebaseToken = await user.getIdToken();

      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_API_URL}/business_cards?${params.toString()}`, { headers: { "x-firebase-token": firebaseToken }}); // Replace with your actual API endpoint
      const data = await response.json();

      // Add the tags to the business cards
      const includedTags = data.business_cards.included;
      const businessCards = data.business_cards.data;
      const businessCardsWithTags = businessCards.map((businessCard: any) => {
        const tagIds = businessCard.relationships.tags.data.map((tag: any) => tag.id);
        const tags = includedTags.filter((tag: Tag) => tagIds.includes(tag.id));
        return {
          ...businessCard,
          relationships: {
            ...businessCard.relationships,
            tags: {
              data: tags
            }
          }
        }
      });

      setBusinessCards({ data: businessCardsWithTags, included: includedTags });
      setPaginationInfo({
        currentPage: data.current_page,
        totalPages: data.total_pages,
        totalCount: data.total_count,
        isLastPage: data.is_last_page,
      });

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

      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_API_URL}/tags`, { headers: { "x-firebase-token": firebaseToken }}); // Replace with your actual API endpoint
      const data = await response.json();

      // Add all tags to the search tags
      const tags = data.data;
      const searchTags = tags.map((tag: TagResponse) => {
        // Check if tag is in the query string
        const tagIds = params.getAll("tags[]");
        const selected = tagIds.includes(tag.id);

        return {
          ...tag.attributes,
          selected: selected
        }
      });

      setSearchTags(searchTags);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  const changePage = async (page: number) => {
    // Change URL to append page number
    const copiedParams = new URLSearchParams(params);

    copiedParams.set("page", page.toString());

    // Remove page from params if it is not a number
    if (isNaN(Number(copiedParams.get('page')))) {
      copiedParams.delete('page');
    }

    // Remove q from params if it is empty or null
    if (copiedParams.get('q') === "" || copiedParams.get('q') === null) {
      copiedParams.delete('q');
    }

    setParams(copiedParams);

    window.history.pushState({}, "", window.location.pathname + "?" + copiedParams.toString())
  }

  const changeQ = async (q: string) => {
    setSearch(q);
    console.log("q", q)
    // Change URL to append page number
    const copiedParams = new URLSearchParams(params);

    copiedParams.set("q", q);

    // Should be 1 if q is changed
    copiedParams.set("page", "1");

    // Remove q from params if it is empty or null
    if (copiedParams.get('q') === "" || copiedParams.get('q') === null) {
      copiedParams.delete('q');
    }

    setParams(copiedParams);

    window.history.pushState({}, "", window.location.pathname + "?" + copiedParams.toString())
  }

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

    // Change URL to append page number
    const copiedParams = new URLSearchParams(params);

    const numberOfSelectedTags = newSearchTags.filter((searchTag) => (searchTag.selected)).length;
    copiedParams.delete("tags[]");
    if (numberOfSelectedTags === 0 || numberOfSelectedTags == newSearchTags.length) {

    } else {
      newSearchTags.filter((searchTag) => (searchTag.selected)).forEach((searchTag) => {
        copiedParams.append("tags[]", searchTag.id);
      })
    }

    // Should be 1 if tags is changed
    copiedParams.set("page", "1");


    // Remove q from params if it is empty or null
    if (copiedParams.get('q') === "" || copiedParams.get('q') === null) {
      copiedParams.delete('q');
    }

    setParams(copiedParams);

    window.history.pushState({}, "", window.location.pathname + "?" + copiedParams.toString())
  }

  if (loading) {
    return (
      <div></div>
    )
  }

  return (
    <main>
      <Header />

      <div className="container mx-auto max-w-screen-lg p-4">
        <Input
          placeholder="Search..."
          className="w-full"
          value={search}
          onChange={(e) => changeQ(e.target.value)}
        />

        <div className="p-4">
          <div className="flex flex-wrap gap-1">
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
          {businessCards.data.map((card, index) => (
            <div key={index} className="bg-white rounded shadow cursor-pointer" onClick={() => {
              router.push(`/cards/${card.attributes.code}`);
            }}>
              <div>
                <img src={card.attributes.front_image_url} alt="Front of business card" />
              </div>
              <div className="p-4 border-bottom">
                <div>
                  <span className="font-semibold">{card.attributes.last_name} {card.attributes.first_name}</span>
                </div>
                <div>{card.attributes.email}</div>
                <div>{card.attributes.home_phone}</div>

                <div className="mt-4 flex flex-wrap gap-1">
                  {card.relationships.tags.data.map((tag, index) => (
                    <Badge key={index}>{tag.attributes.name}</Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-8 pb-16">
          <Pagination
            paginationInfo={paginationInfo}
            changePage={changePage}
          />
        </div>

      </div>

    </main>
  );
}
