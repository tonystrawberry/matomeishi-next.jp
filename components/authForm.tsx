"use client" // This is a client component 👈🏽

// Component: AuthForm
// Shows the authentication form (sign in with email, sign in with Google)

import * as React from "react"
import {GoogleAuthProvider, getAuth, isSignInWithEmailLink, sendSignInLinkToEmail, signInWithEmailLink, signInWithPopup} from "firebase/auth"

import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { app } from "@/app/firebase"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AtSign } from "lucide-react"

interface AuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AuthForm({ className, ...props }: AuthFormProps) {
  const router = useRouter()

  const [isLoading, setIsLoading] = useState<boolean>(false) // isLoading is true when the user clicks the "Sign in with Email" button
  const [email, setEmail] = useState<string>("") // Email address of the user
  const [emailVerificationDialogOpen, setEmailVerificationDialogOpen] = useState<boolean>(false) // emailVerificationDialogOpen is true when we need to ask the user to verify their email address
  const [verificationEmail, setVerificationEmail] = useState<string>("") // verificationEmail is the email address the user entered in the email verification dialog

  // Google Auth Provider for Google Sign in
  const provider = new GoogleAuthProvider()
  const auth = getAuth(app)

  useEffect(() => {
    executeSignInWithEmailLink()
  }, [])

  /***** Functions *****/

  // Sign in with email link containing the apiKey query string parameter
  // Check if the URL contains a query string apiKey (that would mean the user clicked the sign in link in their email
  // and is trying to sign in with their email address
  // Reference: https://firebase.google.com/docs/auth/web/email-link-auth#complete_sign_in_with_the_email_link
  const executeSignInWithEmailLink = () => {
    // Get the `apiKey` query string parameter
    const params = new URLSearchParams(window.location.search)
    const apiKey = params.get('apiKey')

    // Check if the sign in link is valid with isSignInWithEmailLink()
    if (apiKey && isSignInWithEmailLink(auth, window.location.href)) {
      setIsLoading(true)

      // Retrieve the email address from local storage (we saved it when we sent the sign in link to the user's email address)
      let email = window.localStorage.getItem('emailForSignIn') || verificationEmail
      if (!email) {
        // User opened the link on a different device. To prevent session fixation
        // attacks, ask the user to provide the associated email again.

        setEmailVerificationDialogOpen(true)
        return
      }

      // Sign in the user with their email address
      signInWithEmailLink(auth, email, window.location.href)
        .then((_result) => {
          setEmailVerificationDialogOpen(false)
          window.localStorage.removeItem('emailForSignIn') // Clear email from storage because we don't need it anymore

          router.push("/cards") // Redirect to /cards page after successful sign in
        })
        .catch((error) => {
          setEmailVerificationDialogOpen(false)
          console.error("[matomeishi]", error)

          toast({
            variant: "destructive",
            title: "Uh oh! Link is expired or email is wrong.",
            description: "Please try again.",
          })
        })
    }
  }

  // Send sign in link to email address
  // Called when the user clicks the "Sign in with Email" button
  // Reference: https://firebase.google.com/docs/auth/web/email-link-auth#send_an_authentication_link_to_the_users_email_address
  const signInWithEmail = () => {
    setIsLoading(true)

    sendSignInLinkToEmail(auth, email, {
      url: `${process.env.NEXT_PUBLIC_HOST_URL}:3001`,
      handleCodeInApp: true,
    }).then(() => {
      setIsLoading(false)
      // Save the email address to local storage
      // We need this to get the email address when the user clicks the sign in link in their email
      window.localStorage.setItem('emailForSignIn', email)
      toast({
        title: "We sent you an email!",
        description: "Please check your mailbox.",
      })
    })
    .catch((error) => {
      setIsLoading(false)
      console.error("[matomeishi]", error)

      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with our server.",
      })
    })
  }

  // Sign in with Google
  // Called when the user clicks the "Sign in with Google" button
  // Reference: https://firebase.google.com/docs/auth/web/google-signin
  const signInWithGoogle = () => {
    signInWithPopup(auth, provider)
    .then(() => {
      router.push("/cards") // Redirect to /cards page after successful sign in
    }).catch((error) => {
      console.error("[matomeishi]", error)

      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with our server.",
      })
    })
  }

  // Sign in with email address
  // Called when the user clicks the "Sign in" button in the email verification dialog
  const onClickSignInVerifyEmail = () => {
    executeSignInWithEmailLink()
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form>
        <div className="grid gap-2">
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              placeholder="matomeishi@gmail.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <Button disabled={isLoading} onClick={signInWithEmail}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            <AtSign className="mr-2 h-4 w-4" />Sign in with Email
          </Button>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <Button variant="destructive" type="button" disabled={isLoading} onClick={signInWithGoogle}>
        {isLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.google className="mr-2 h-4 w-4" />
        )}{" "}
        Sign in with Google
      </Button>

      {/* Email verification dialog */}
      <Dialog open={emailVerificationDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><AtSign />Please enter your email address</DialogTitle>
            <DialogDescription>
              It seems like you tried to sign in with your email address on a different device. Please enter your email address below to sign in.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Input
              placeholder="john.doe@gmail.com"
              className="col-span-3"
              type="email"
              value={verificationEmail}
              onChange={(e) => setVerificationEmail(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" onClick={onClickSignInVerifyEmail}>Sign in</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
