import React from "react"
import { Palmtree } from "lucide-react"

// Component: Loading
// Shows the loading component (spinner)

const Loading = () => {
  return (
    <div className="w-full flex justify-center items-center h-screen">
      <div className="animate-pulse w-32 h-32 bg-black rounded-full flex justify-center items-center text-white">
        <Palmtree className="w-16 h-16"/>
      </div>
    </div>
  )
}

export { Loading }
