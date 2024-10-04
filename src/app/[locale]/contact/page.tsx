"use client";
import Divider from "@/components/divider"
import { Fragment, Suspense, useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import CloseIcon from '@mui/icons-material/Close';
import dynamic from "next/dynamic";
import { SnackbarCloseReason, IconButton, Snackbar, Alert, AlertColor } from "@mui/material";
//import { MapContainer, TileLayer } from "react-leaflet";
import { firestore } from "@/components/firebase";
import { collection, addDoc } from "firebase/firestore";

// convert browser component to client component
export const MapComponent = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), {ssr: false});
export const MapTileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), {ssr: false});

type Message = {
    name: String,
    email: String,
    phone: String,
    message: String,
};

export default function Contact() {
    const site_key: string|undefined = process.env.NEXT_PUBLIC_reCAPTCHA_SITE_KEY;
    const [captcha_ignored, setCaptcha] = useState(false);
    const recaptcha_ref = useRef<ReCAPTCHA>(null);

    const [open, setOpen] = useState(false);
    const [severity, setSeverity] = useState<AlertColor>("success")
    const [message, setMessage] = useState(" ");

    const openSnackBar = () => {
        setOpen(true);
    };

    const closeSnackBar = (event : React.SyntheticEvent | Event, reason? : SnackbarCloseReason,) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };

    const action = (
        <Fragment>
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={closeSnackBar}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Fragment>
    );

    const handle_submit = async (e: any) => {
        e.preventDefault(); // prevent refresh page

        if (!recaptcha_ref.current?.getValue()) {
            console.log("recaptcha not completed")
            setCaptcha(true);
            return;
        }

        const formData = new FormData(e.target);
        const formProps = Object.fromEntries(formData);

        const isValid: boolean = await fetch("http://localhost:5000/recaptcha", {
            method: "POST",
            body: JSON.stringify({
                response: recaptcha_ref.current.getValue()
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        })
        .then((response) => response.json())
        .then((json) => {
            if (json.success) {
                return true;
            } else {
                return false;
            }
        });

        if (isValid) {
            console.log("verification success");

            // actually send the message to firebase
            const message: Message = {
                name: formProps["name"].toString(),
                email: formProps["email"].toString(),
                phone: formProps["phone"].toString(),
                message: formProps["message"].toString()
            }

            try {
                const docRef = await addDoc(collection(firestore, "messages"), message);
                console.log("Document written with ID: ", docRef.id);

                setSeverity("success");
                setMessage("Your message has been sent!");
                openSnackBar();
                e.target.reset();
                recaptcha_ref.current.reset();
                setCaptcha(false);
            } catch (e) {
                console.error("Error adding document: ", e);
                setSeverity("error");
                setMessage("Error encountered when trying to send message.");
                openSnackBar();
            }
        } else {
            console.log("verification fail");
            setSeverity("error");
            setMessage("Please complete the captcha again");
            openSnackBar();
        }
    }

    return (
        <div className="main_content_div">
            <Divider/>
            <Snackbar
                open={open}
                anchorOrigin={{vertical: "bottom", horizontal: "center"}}
                autoHideDuration={6000}
                onClose={closeSnackBar}
                action={action}>
                <Alert
                    onClose={closeSnackBar}
                    severity={severity}
                    variant="filled"
                    sx={{ width: '100%' }}>
                    {message}
                </Alert>
            </Snackbar>
            <div>
                <form onSubmit={handle_submit} action="" method="post">
                    <div className="flex">
                        <span className="m-auto text-2xl mt-2">Contact Us</span>
                    </div>
                    <div className="flex">
                        <div className="block-inline mx-auto w-1/2">
                            <div className="p-8 w-full h-full">
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Name"
                                    className="outline-none border-2 block m-auto w-1/2 h-8"></input>
                                <br></br>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email (required)"
                                    className="outline-none border-2 block m-auto w-1/2 h-8"
                                    required={true}></input>
                                <br></br>
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Phone"
                                    className="outline-none border-2 block m-auto w-1/2 h-8"></input>
                                <br></br>
                            </div>

                        </div>
                        <div className="block-inline mx-auto w-1/2">
                            <div className="p-8 w-full">
                                <textarea
                                    name="message"
                                    maxLength={1024}
                                    placeholder="Message"
                                    className="outline-none border-2 w-full h-full p-2 min-h-12"></textarea>
                            </div>
                            <div className="flex mb-8">
                                <div className="ml-0 pl-8">
                                    {captcha_ignored ? <div className="border-2 border-red-500">
                                        <ReCAPTCHA ref={recaptcha_ref} sitekey={site_key||""} className=""/>
                                        Please complete the captcha.
                                    </div> : <div className="border-2 border-white">
                                        <ReCAPTCHA ref={recaptcha_ref} sitekey={site_key||""} className=""/>
                                    </div>}

                                </div>

                            </div>
                        </div>
                    </div>
                    <div className="flex mb-8">
                        <button
                            className="mx-auto border-2 bg-blue-400 rounded-full w-1/4 h-10 text-white text-xl font-medium hover:bg-blue-500 active:bg-blue-600">Submit</button>
                    </div>
                </form>

            </div>
            <Divider/>
                <div className="h-[600px] w-1/2 mx-auto p-8">
                    <MapComponent
                        center={[51.505, -0.09]}
                        zoom={10}
                        zoomControl={false}
                        scrollWheelZoom={true}
                        className="h-full rounded-3xl border-2 focus:border-blue-500">
                        <Suspense>
                            <MapTileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                        </Suspense>

                    </MapComponent>
                </div>
            <Divider/>
        </div>
    );
}