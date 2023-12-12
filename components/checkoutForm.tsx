import React, {useContext, useState} from 'react';
import {useStripe, useElements, PaymentElement} from '@stripe/react-stripe-js';
import { Button } from "@/components/ui/button";
import { AuthContext } from "@/contexts/authContext";
import { User } from "firebase/auth"
import withAuth from "@/components/withAuth";

function CheckoutForm({ selectedPriceId }: { selectedPriceId: string }) {
  const stripe = useStripe();
  const elements = useElements();

  const { user } = useContext(AuthContext) as { user: User }

  const [errorMessage, setErrorMessage] = useState();
  const [loading, setLoading] = useState(false);

  const handleError = (error: any ) => {
    setLoading(false);
    setErrorMessage(error.message);
  }

  const handleSubmit = async (event: any) => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setLoading(true);

    // Trigger form validation and wallet collection
    const {error: submitError} = await elements.submit();
    if (submitError) {
      handleError(submitError);
      return;
    }

    const firebaseToken = await user.getIdToken() // Get the Firebase access token
    const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_API_URL}/subscriptions/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-firebase-token": firebaseToken },
      body : JSON.stringify({ price_id: selectedPriceId })
    });

    const { type, client_secret } = await res.json();
    const confirmIntent = type === "setup" ? stripe.confirmSetup : stripe.confirmPayment;

    // Confirm the intent using the details collected by the Payment Element
    const { error } = await confirmIntent({
      elements,
      clientSecret: client_secret,
      confirmParams: {
        return_url: 'http://localhost:3001/subscriptions/',
      },
    });

    if (error) {
      // This point is only reached if there's an immediate error when confirming the Intent.
      // Show the error to your customer (for example, "payment details incomplete").
      handleError(error);
    } else {
      // Your customer is redirected to your `return_url`. For some payment
      // methods like iDEAL, your customer is redirected to an intermediate
      // site first to authorize the payment, then redirected to the `return_url`.
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <Button type="submit" disabled={!selectedPriceId || !stripe || loading}>
        Submit Payment
      </Button>
      {errorMessage && <div>{errorMessage}</div>}
    </form>
  );
}

export default withAuth(CheckoutForm)
