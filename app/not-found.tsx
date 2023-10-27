"use client"; // This is a client component 👈🏽

import { Button } from "@/components/ui/button";
import { Palmtree } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <main>
      <div className="container mx-auto max-w-screen-lg p-4">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">

            <h1 className="flex justify-center items-center gap-2 text-9xl font-bold">
              4
              <div className="flex justify-center items-center">
                <div className="w-16 h-16 bg-black rounded-full flex justify-center items-center text-white">
                  <Palmtree className="w-8 h-8"/>
                </div>
              </div>
              4
              </h1>
            <div className="text-xl font-light text-muted-foreground">Sorry, we could not find this page.</div>
            <Button onClick={() => {router.push('/')}} className="mt-4">Back</Button>
          </div>
        </div>
      </div>
    </main>
  );
}
