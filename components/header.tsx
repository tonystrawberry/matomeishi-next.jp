import React from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { getAuth, signOut } from "firebase/auth";
import { app } from "@/app/firebase";
import {
  Menu,
  Palmtree,
  PlusCircle,
  Tag,
  Unplug,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Component: Header
// Shows the header of the app (logo, buttons, etc.)

const Header = () => {
  const router = useRouter();

  // Callback function when the user clicks the "Logout" button
  const logout = () => {
    const auth = getAuth(app);
    signOut(auth)
      .then(() => {
        // Sign-out successful
        router.push("/");
      })
      .catch((error) => {
        console.error("[matomeishi]", error);

        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "There was a problem with our server.",
        });

        router.push("/");
      });
  };

  return (
    <header className="container mx-auto max-w-screen-lg p-4 text-white flex justify-between items-center">
      {/* Logo */}
      <div className="flex items-center">
        <div className="w-16 h-16 bg-black rounded-full flex justify-center items-center">
          <Palmtree className="w-8 h-8" />
        </div>
      </div>

      <div className="flex gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="text-black" variant="outline">
              <Menu />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => router.push("/cards/new")}
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                <span>Business Card</span>
                {/* TODO: Add keyboard shortcut */}
                {/* <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut> */}
              </DropdownMenuItem>

              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => router.push("/tags")}
              >
                <Tag className="w-4 h-4 mr-2" />
                <span>Manage Tags</span>
                {/* TODO: Add keyboard shortcut */}
                {/* <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut> */}
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="cursor-pointer" onClick={logout}>
              <Unplug className="w-4 h-4 mr-2" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
