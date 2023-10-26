import React, { useContext } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { getAuth, signOut } from "firebase/auth";
import { app } from "@/app/firebase";

const Header = () => {
  const router = useRouter();

  const logout = () => {
    const auth = getAuth(app);
    signOut(auth).then(() => {
      // Sign-out successful.
      router.push("/")
    }).catch((error) => {
      // An error happened.
    });
  }

  return (
    <header className=" p-4 text-white flex justify-between items-center">
      {/* Logo */}
      <div className="flex items-center">
        <div className="w-10 h-10 bg-black rounded-full"></div>
      </div>

      <div className="flex gap-4">
        <Button variant="secondary" onClick={() => router.push("/cards/new")}>Add Business Card</Button>

        {/* Logout Button */}
        <Button onClick={logout}>Logout</Button>
      </div>
    </header>
  );
};

export default Header;
