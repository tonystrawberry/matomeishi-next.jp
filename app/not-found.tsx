"use client"; // This is a client component 👈🏽

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <main>
      <div className="container mx-auto max-w-screen-lg p-4">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-9xl font-bold">404</h1>
            <div className="text-xl font-light">Sorry, we could not find this page.</div>
            <Button onClick={() => {router.push('/')}} className="mt-4">Back</Button>
          </div>
        </div>
      </div>
    </main>
  );
}
