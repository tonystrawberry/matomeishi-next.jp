"use client" // This is a client component 👈🏽

// URL: /subscriptions
// This page allows the user to see all of their subscriptions

import Header from "@/components/header"
import { useRouter } from "next/navigation"
import React, { use, useContext, useEffect, useState } from "react"
import withAuth from "../../components/withAuth"
import { CheckCircle2, DollarSign, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import CheckoutForm from "@/components/checkoutForm"
import { AuthContext } from "@/contexts/authContext"
import { User } from "firebase/auth"

const stripePromise = loadStripe("pk_test_51OM9Q1Har31BZeHdiBmqyks4b0zxTnckV3zeKNaGoPRZdYJOMKzpZCfPePnVag0CHDgB4wsEvKNqvlZ4JkvXds1g006hYEfo2D");

function Subscriptions() {
  const router = useRouter()
  const { user } = useContext(AuthContext) as { user: User }

  const [selectedPriceId, setSelectedPriceId] = useState<string>("")
  const [currentSubscription, setCurrentSubscription] = useState<any>(null)

  useEffect(() => {
    const fetchCurrentSubscription = async () => {
      const firebaseToken = await user.getIdToken() // Get the Firebase access token
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_API_URL}/subscriptions/current`, {
        method: "GET",
        headers: { "Content-Type": "application/json", "x-firebase-token": firebaseToken },
      });

      const { data: { attributes } } = await res.json();
      setCurrentSubscription(attributes)
    }

    fetchCurrentSubscription()
  }, [])

  /***** Functions *****/

  // Cancel the current subscription by calling the API
  const cancelSubscription = async () => {
    const firebaseToken = await user.getIdToken() // Get the Firebase access token
    const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_API_URL}/subscriptions/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-firebase-token": firebaseToken },
      body : JSON.stringify({ subscription_id: currentSubscription.subscription_id })
    });

    const { data: { attributes } } = await res.json();
    setCurrentSubscription(attributes)
  }

  // Reactivate the current subscription by calling the API
  const reactivateSubscription = async () => {
    const firebaseToken = await user.getIdToken() // Get the Firebase access token
    const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_API_URL}/subscriptions/reactivate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-firebase-token": firebaseToken },
      body : JSON.stringify({ subscription_id: currentSubscription.subscription_id })
    });

    const { data: { attributes } } = await res.json();
    setCurrentSubscription(attributes)
  }

  // Change the plan of the current subscription by calling the API
  const changePlan = async (plan_type: string) => {
    const firebaseToken = await user.getIdToken() // Get the Firebase access token
    const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_API_URL}/subscriptions/change_plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-firebase-token": firebaseToken },
      body : JSON.stringify({ subscription_id: currentSubscription.subscription_id, plan_type })
    });

    const { data: { attributes } } = await res.json();
    setCurrentSubscription(attributes)
  }

  // Cancel the downgrade of the current subscription by calling the API
  const cancelDowngrade = async () => {
    const firebaseToken = await user.getIdToken() // Get the Firebase access token
    const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_API_URL}/subscriptions/cancel_downgrade`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-firebase-token": firebaseToken },
      body : JSON.stringify({ subscription_id: currentSubscription.subscription_id })
    });

    const { data: { attributes } } = await res.json();
    setCurrentSubscription(attributes)
  }

  // Open the payment modal
  const openPaymentModal = (priceId: string) => {
    setSelectedPriceId(priceId)
  }


  return (
    <main>
      <Header />

      <div className="container mx-auto max-w-screen-lg p-4">
        <Button
          variant="secondary"
          onClick={() => {
            router.push("/cards")
          }}
        >
          Back
        </Button>
        <Separator className="my-4" />

        {/* Current Subscription */}
        { currentSubscription && (
          <div className="w-full my-4">
            <Card className="w-full flex">
              <CardHeader>
                <CardTitle>Current Subscription</CardTitle>
                <CardDescription>Manage your current subscription.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-1 p-6">
                <h1 className="text-3xl font-bold">{ currentSubscription.plan_type }</h1>
                <p className="text-sm text-muted-foreground">From { currentSubscription.term_from } until { currentSubscription.term_to }</p>

                {
                  currentSubscription.cancel_at_period_end && (
                    <>
                      <p className="text-sm text-muted-foreground">Your subscription will end at the end of the period. You will not be charged anymore.</p>
                      <Button variant="default" className="w-full mt-4" onClick={reactivateSubscription}>Reactivate your subscription</Button>
                    </>
                  )
                }

                {
                  currentSubscription.will_downgrade_to && (
                    <>
                      <p className="text-sm text-muted-foreground">Your subscription will downgrade to { currentSubscription.will_downgrade_to } at the end of the period. You will then be charged $3 per month.</p>
                      <Button variant="default" className="w-full mt-4" onClick={cancelDowngrade}>Cancel the downgrade</Button>
                    </>
                  )
                }

                {
                  !currentSubscription.cancel_at_period_end && !currentSubscription.will_downgrade_to && (
                    <>
                      <p className="text-sm text-muted-foreground">Your subscription will be renewed automatically.</p>
                      <Button variant="destructive" className="w-full mt-4" onClick={cancelSubscription}>Cancel your subscription</Button>
                    </>
                  )
                }
              </CardContent>
            </Card>
          </div>
        )}

        {/* Choose between our different plans and get started with your subscription. */}
        <div className="flex items-center">
          <Star className="mr-2 h-6 w-6" />

          <h1 className="text-2xl font-semibold">Subscriptions</h1>
        </div>

        <p className="text-sm text-muted-foreground">
          Browse our different plans and get started with your subscription.
        </p>

        <div className="w-full my-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <CardDescription>Let&apos;s get started by storing up to 5 business cards.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <h1 className="text-6xl font-bold relative"><DollarSign className="h-8 w-8 absolute right-10"/>0</h1>
                </div>
                <Separator className="my-8" />

                <div className="my-4">
                  <div className="flex justify-center items-center my-2 relative">
                    <CheckCircle2 className="w-4 h-4 mr-2 absolute left-0" />
                    <p className="font-normal">Automated Card Scanning</p>
                  </div>
                  <div className="flex justify-center items-center my-2 relative">
                    <CheckCircle2 className="w-4 h-4 mr-2 absolute left-0" />
                    <p className="font-normal">Keyword & Tag Search</p>
                  </div>
                  <div className="flex justify-center items-center my-2 relative">
                    <CheckCircle2 className="w-4 h-4 mr-2 absolute left-0" />
                    <p className="font-normal">Tag Management</p>
                  </div>
                  <div className="flex justify-center items-center my-2 relative">
                    <CheckCircle2 className="w-4 h-4 mr-2 absolute left-0" />
                    <p className="font-normal">Daily Upload Limit</p>
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                { !currentSubscription && <Button variant="outline" className="w-full">Current Plan</Button> }
                { currentSubscription && !currentSubscription.cancel_at_period_end && <Button variant="default" className="w-full" onClick={cancelSubscription}>Downgrade</Button> }
                { currentSubscription && currentSubscription.cancel_at_period_end && <Button variant="outline" className="w-full" disabled>Will start on {currentSubscription.term_to}</Button> }
              </CardFooter>
            </Card>
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Pro</CardTitle>
                <CardDescription>What about expanding your network up to 100 business cards.</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="flex justify-center">
                  <h1 className="text-6xl font-bold relative"><DollarSign className="h-8 w-8 absolute right-10"/>3</h1>
                </div>
                <Separator className="my-8" />

                <div className="my-4">
                  <div className="flex justify-center items-center my-2 relative">
                    <CheckCircle2 className="w-4 h-4 mr-2 absolute left-0" />
                    <p className="font-normal">Automated Card Scanning</p>
                  </div>
                  <div className="flex justify-center items-center my-2 relative">
                    <CheckCircle2 className="w-4 h-4 mr-2 absolute left-0" />
                    <p className="font-normal">Keyword & Tag Search</p>
                  </div>
                  <div className="flex justify-center items-center my-2 relative">
                    <CheckCircle2 className="w-4 h-4 mr-2 absolute left-0" />
                    <p className="font-normal">Tag Management</p>
                  </div>
                  <div className="flex justify-center items-center my-2 relative">
                    <CheckCircle2 className="w-4 h-4 mr-2 absolute left-0" />
                    <p className="font-normal">Daily Upload Limit</p>
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                { !currentSubscription && <Button variant="default" className="w-full" onClick={() => openPaymentModal('price_1OMVlsHar31BZeHdTk89gPZs')}>Get Started</Button> }
                { currentSubscription && !currentSubscription.cancel_at_period_end && currentSubscription.plan_type === "pro" && <Button variant="outline" className="w-full">Current Plan</Button> }
                { currentSubscription && !currentSubscription.cancel_at_period_end && !currentSubscription.will_downgrade_to && currentSubscription.plan_type === "unlimited" && <Button variant="default" className="w-full" onClick={() => changePlan('pro')}>Downgrade</Button> }
                { currentSubscription && currentSubscription.cancel_at_period_end && <Button variant="outline" className="w-full" disabled>Please reactivate your current subscription first</Button> }
                { currentSubscription && currentSubscription.will_downgrade_to === "pro" && <Button variant="outline" className="w-full" disabled>Will start on {currentSubscription.term_to}</Button> }

              </CardFooter>
            </Card>
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Unlimited</CardTitle>
                <CardDescription>Do not worry anymore about limits and store as much as you can.</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="flex justify-center">
                  <h1 className="text-6xl font-bold relative"><DollarSign className="h-8 w-8 absolute right-[4.5rem]"/>10</h1>
                </div>
                <Separator className="my-8" />

                <div className="my-4">
                  <div className="flex justify-center items-center my-2 relative">
                    <CheckCircle2 className="w-4 h-4 mr-2 absolute left-0" />
                    <p className="font-normal">Automated Card Scanning</p>
                  </div>
                  <div className="flex justify-center items-center my-2 relative">
                    <CheckCircle2 className="w-4 h-4 mr-2 absolute left-0" />
                    <p className="font-normal">Keyword & Tag Search</p>
                  </div>
                  <div className="flex justify-center items-center my-2 relative">
                    <CheckCircle2 className="w-4 h-4 mr-2 absolute left-0" />
                    <p className="font-normal">Tag Management</p>
                  </div>
                  <div className="flex justify-center items-center my-2 relative">
                    <CheckCircle2 className="w-4 h-4 mr-2 absolute left-0" />
                    <p className="font-normal">Daily Upload Limit</p>
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                { !currentSubscription && <Button variant="default" className="w-full" onClick={() => openPaymentModal('price_1OMVmkHar31BZeHdzlW9fyFE')}>Get Started</Button> }
                { currentSubscription && !currentSubscription.cancel_at_period_end && currentSubscription.plan_type === "unlimited" && <Button variant="outline" className="w-full">Current Plan</Button> }
                { currentSubscription && !currentSubscription.cancel_at_period_end && currentSubscription.plan_type === "pro" && <Button variant="default" className="w-full" onClick={() => changePlan('unlimited')}>Upgrade</Button> }
                { currentSubscription && currentSubscription.cancel_at_period_end && <Button variant="outline" className="w-full" disabled>Please reactivate your current subscription first</Button> }
              </CardFooter>
            </Card>
          </div>
        </div>

        <div className="w-full my-4">
          <Elements stripe={stripePromise} options={{
            mode: "subscription",
            amount: 1000,
            currency: "usd",
          }}>
            <CheckoutForm selectedPriceId={selectedPriceId} />
          </Elements>
        </div>
      </div>
    </main>
  )
}

export default withAuth(Subscriptions)
