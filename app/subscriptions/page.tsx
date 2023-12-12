"use client" // This is a client component 👈🏽

// URL: /subscriptions
// This page allows the user to see all of their subscriptions

import Header from "@/components/header"
import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"
import withAuth from "../../components/withAuth"
import { Check, CheckCircle2, DollarSign, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import CheckoutForm from "@/components/checkoutForm"

const stripePromise = loadStripe("pk_test_51OM9Q1Har31BZeHdiBmqyks4b0zxTnckV3zeKNaGoPRZdYJOMKzpZCfPePnVag0CHDgB4wsEvKNqvlZ4JkvXds1g006hYEfo2D");

function Subscriptions() {
  const router = useRouter()

  const [selectedPriceId, setSelectedPriceId] = useState<string>("");

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
                <Button variant="outline" className="w-full">Current Plan</Button>
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
                <Button variant="default" className="w-full" onClick={() => { setSelectedPriceId('price_1OMVlsHar31BZeHdTk89gPZs') }}>Get Started</Button>
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
                <Button variant="default" className="w-full" onClick={() => { setSelectedPriceId('price_1OMVmkHar31BZeHdzlW9fyFE') }}>Get Started</Button>
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
