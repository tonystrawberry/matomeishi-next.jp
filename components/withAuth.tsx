"use strict"

import { useRouter, usePathname } from 'next/navigation'
import { useContext, useEffect } from 'react'
import { AuthContext } from "@/contexts/authContext"
import { Loading } from "@/components/loading"

// HOC: withAuth
// This is a higher order component that checks if the user is authenticated and redirects to the login page if not.
// Usage: export default withAuth(MyComponent)

const withAuth = (WrappedComponent: any) => {
  const WithAuthComponent: React.FC = (props: any) => {
    const router = useRouter()
    const pathname = usePathname()

    const { user, loading } = useContext(AuthContext)

    useEffect(() => {
      if (!loading){
        if (!user) {
          // The user is not authenticated and should be redirected to the login page
          router.push("/")
          return
        } else if (pathname === "/") {
          // The user is authenticated so redirect the user to the dashboard if the user is on the login page
          router.push("/cards")
          return
        }
      }
    }, [loading, user, router])

    if (loading) {
      return <Loading />
    } else {
      return <WrappedComponent {...props} />
    }
  }

  return WithAuthComponent
}


export default withAuth
