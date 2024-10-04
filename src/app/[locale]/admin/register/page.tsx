"use client";
import Divider from "@/components/divider";
import { useRouter } from '@/src/i18n/routing'
import { createUserWithEmailAndPassword, AuthErrorCodes, sendEmailVerification, applyActionCode } from "firebase/auth";
import { auth } from "@/components/firebase";
import { SnackbarCloseReason, IconButton, Snackbar, Alert } from "@mui/material";
import { FirebaseError } from "firebase/app";
import { useState, Fragment } from "react";
import CloseIcon from '@mui/icons-material/Close';

export default function Register() {
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

    const handleRegister = async (e: any) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const formProps = Object.fromEntries(formData);

        // register before redirecting

        const email = formProps["email"].toString();
        const password = formProps["password"].toString();
        const confirmPassword = formProps["confirmPassword"].toString();

        if (password != confirmPassword) {
            setMessage("Please confirm your password.");
            openSnackBar();
            return;
        }

        createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // signed up
            const user = userCredential.user;
            if (user) {
                sendEmailVerification(user, {url: "http://localhost:3000/en/admin/login"}).then(() => {
                    setMessage("Please verify your email.");
                    openSnackBar();
                }) 
                //router.push("/admin/products");
            }
        })
        .catch((error: FirebaseError) => {
            console.log(error.code)
            switch(error.code) {
                case AuthErrorCodes.INVALID_LOGIN_CREDENTIALS:
                    setMessage("Wrong email or password.");
                    break;
                case AuthErrorCodes.INVALID_EMAIL:
                    setMessage("Please enter a valid email.");
                    break;
                case "auth/missing-password":
                    setMessage("Please enter a password.");
                    break;
                case AuthErrorCodes.WEAK_PASSWORD:
                    setMessage("Please enter a stronger password.");
                    break;
                case AuthErrorCodes.EMAIL_EXISTS:
                    setMessage("Email exists, try resetting password if you forgot.");
                    break;
            }
            openSnackBar();
        });
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
            <div className="text-2xl font-medium mx-auto mb-4">Register</div>
            <form className="mx-auto" onSubmit={handleRegister} method="post">
                <input
                    type="text"
                    name="email"
                    placeholder="Email"
                    className="outline-none border-2 w-full h-full p-2 my-4"></input>
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    className="outline-none border-2 w-full h-full p-2 my-4"></input>
                <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    className="outline-none border-2 w-full h-full p-2 my-4"></input>
                    
                <div className="flex w-full">
                    <button className="mx-auto mt-4 mb-10 border-2 bg-blue-400 rounded-full w-1/2 h-10 text-white text-xl font-medium hover:bg-blue-500 active:bg-blue-600">Register</button>
                </div>
                
            </form>
        </div>
        <Divider/>
    </div>
);
}