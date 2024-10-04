"use client";
import Divider from '@/components/divider';
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY||"");

export default function Checkout() {
    const priceID = useSearchParams().get("price_id");
    console.log(priceID);
    const fetchClientSecret = useCallback(() => {
        // Create a Checkout Session
        return fetch("http://localhost:5000/create-checkout-session", {
            method: "POST",
            body: JSON.stringify({
                priceID: priceID
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        }).then((res) => res.json()).then((data) => data.clientSecret);
    }, []);

    const options = {
        fetchClientSecret
    };

    return (
        <div className="main_content_div">
            <Divider/>
                <div id="checkout">
                    <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
                        <EmbeddedCheckout/>
                    </EmbeddedCheckoutProvider>
                </div>
            <Divider/>
        </div>
    );
}