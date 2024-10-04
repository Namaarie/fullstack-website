"use client"
import Divider from "@/components/divider";
import { useRouter } from "next/navigation";
import { AuthErrorCodes, sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/components/firebase";
import { Fragment, useState } from "react";
import Snackbar, { SnackbarCloseReason } from "@mui/material/Snackbar";
import { Alert, IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { FirebaseError } from "firebase/app";

export default function ForgotPassword() {
    const router = useRouter();

    const [open, setOpen] = useState(false);

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

    const handleReset = async (e: any) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const formProps = Object.fromEntries(formData);
        console.log(formProps)
        // login before redirecting
        
        const email = formProps["email"].toString();

        if (email == "") {
            setMessage("Please enter a valid email.");
            openSnackBar();
            return;
        }

        sendPasswordResetEmail(auth, email).then(() => {
            setMessage("Password reset email sent!");
            openSnackBar();
        })
        .catch((error) => {
            console.log(error);
        })

    }

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
                    severity="error"
                    variant="filled"
                    sx={{ width: '100%' }}>
                    {message}
                </Alert>
            </Snackbar>
            <div className="flex flex-col mt-10">
                <div className="text-2xl font-medium mx-auto mb-4">Forgot Password</div>
                <form className="mx-auto" onSubmit={handleReset}>
                    <input
                        type="text"
                        name="email"
                        placeholder="Email"
                        className="outline-none border-2 w-full h-full p-2 my-4"></input>
                        
                    <div className="flex">
                        <div className="flex w-full">
                            <button className="mx-auto mt-4 mb-10 border-2 bg-blue-400 rounded-full w-full h-10 text-white text-xl font-medium hover:bg-blue-500 active:bg-blue-600">Send Reset Email</button>
                        </div>
                    </div>
                    
                </form>
            </div>
            <Divider/>
        </div>
    );
}