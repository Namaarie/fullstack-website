"use client";
import Divider from "@/components/divider";
import { unstable_setRequestLocale } from "next-intl/server";
import { useSearchParams  } from "next/navigation";
import React, { Suspense } from "react";
import { useEffect, useState } from "react";

function ReturnPage(){
    const session_id = useSearchParams().get("session_id");
    const [success, setSuccess] = useState<boolean|null>(null);
    fetch(`http://localhost:5000/session_status?session_id=${session_id}`).then((res) => {
        console.log(res);
        return res.json();
    }).then((session) => {
        console.log(session);
        if (session.status == 'open') {
            // Remount embedded Checkout
            console.log("open");
            setSuccess(false);
        } else if (session.status == 'complete') {
            // Show success page Optionally use session.payment_status or
            // session.customer_email to customize the success page
            console.log("success");
            setSuccess(true);
        }
    });

    const display = function() {
        if (success == null) {
            return <></>
        }

        if (success) {
            return (
                <div className="flex h-80">
                    <div className="mx-auto my-auto text-2xl">
                        Thank you for purchasing!
                    </div>
                </div>
            );
        } else {
            return (
                <div className="flex h-80">
                    <div className="mx-auto my-auto text-2xl">
                        Something went wrong :c
                    </div>
                </div>
            );
        }
    }

    return (
    <div className="main_content_div">
        <Divider/>
            {display()}
        <Divider/>
    </div>
    );
}

export default function Return({params: {locale}} : {params: {locale: string}}) {
    return (
        <Suspense>
            <ReturnPage/>
        </Suspense>
    );
}

