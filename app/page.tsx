"use client" // This is a client component 👈🏽

import Image from "next/image"
import { AuthForm } from "@/components/authForm"
import { Palmtree, WalletCards } from "lucide-react"
import withAuth from "@/components/withAuth"

// URL: /
// This page is the landing page of the application.
// It contains a sign in form and a hero image.

export function AuthenticationPage() {
  return (
    <>
      <div className="md:hidden">
        <Image
          src="/examples/authentication-light.png"
          width={1280}
          height={843}
          alt="Authentication"
          className="block dark:hidden"
        />
        <Image
          src="/examples/authentication-dark.png"
          width={1280}
          height={843}
          alt="Authentication"
          className="hidden dark:block"
        />
      </div>
      <div className="container relative hidden h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
          <div className="absolute inset-0 bg-zinc-900" />
          <div className="relative z-20 flex items-center text-xl font-medium">
            <Palmtree className="w-6 h-6 mr-2" />
            matomeishi
          </div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="flex items-center jusitfy-center text-2xl font-semibold tracking-tight">
                Let&apos;s store business cards <WalletCards className="h-6 w-6 ml-2" />
              </h1>
              <p className="text text-muted-foreground">
                Sign in to start storing business cards.
              </p>
            </div>

            {/* The authentication form containing the buttons to sign in with Google and email. */}
            <AuthForm />
          </div>
        </div>
      </div>
    </>
  )
}

export default withAuth(AuthenticationPage)
