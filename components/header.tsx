import React from "react"
import { Button } from "./ui/button"
import { useRouter } from "next/navigation"
import { getAuth, signOut } from "firebase/auth"
import { app } from "@/app/firebase"
import { Palmtree, PlusCircle, Unplug } from "lucide-react"
import { toast } from "./ui/use-toast"

// Component: Header
// Shows the header of the app (logo, buttons, etc.)

const Header = () => {
  const router = useRouter()

  // Callback function when the user clicks the "Logout" button
  const logout = () => {
    const auth = getAuth(app)
    signOut(auth).then(() => {
      // Sign-out successful
      router.push("/")
    }).catch((error) => {
      console.error("[matomeishi]", error)

      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with our server.",
      })

      router.push("/")
    })
  }

  return (
    <header className=" p-4 text-white flex justify-between items-center">
      {/* Logo */}
      <div className="flex items-center">
        <div className="w-16 h-16 bg-black rounded-full flex justify-center items-center">
          <Palmtree className="w-8 h-8"/>
        </div>
      </div>

      <div className="flex gap-4">
        {/* New Business Card Button */}
        <Button  onClick={() => router.push("/cards/new")}><PlusCircle className="w-4 h-4 mr-2" />Business Card</Button>

        {/* Logout Button */}
        <Button variant="outline" onClick={logout} className="text-black"><Unplug className="w-4 h-4 mr-2" />Logout</Button>
      </div>
    </header>
  )
}

export default Header
