"use client";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Divider from "@/components/divider";
import { Fragment, useRef, useState } from 'react';
import Stack from '@mui/material/Stack';
import { firestore, storage } from '@/components/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';
import Image from "next/image";
import { SnackbarCloseReason, IconButton, Snackbar, Alert, AlertColor } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

type Product = {
    name: string;
    detail: string;
    price: number;
};

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: "500px",
    height: "fit",
    bgcolor: 'white',
    border: "2px solid",
    boxShadow: 24,
    p: 4,
};

export default function Test() {
    const [open, setOpen] = useState(false);
    const handleOpen = () => {
        setImage("/placeholder.svg");
        setOpen(true);
    };
    const handleClose = () => setOpen(false);

    const storageRef = ref(storage, "image");
    const imageInputRef = useRef<HTMLInputElement>(null);

    const [image, setImage] = useState("/placeholder.svg");

    const [file, setFile] = useState<String>();

    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [severity, setSeverity] = useState<AlertColor>("success")
    const [message, setMessage] = useState(" ");

    const openSnackBar = () => {
        setOpenSnackbar(true);
    };

    const closeSnackBar = (event : React.SyntheticEvent | Event, reason? : SnackbarCloseReason,) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpenSnackbar(false);
    };

    const browseFile = () => {
        imageInputRef.current?.click();
    }

    const uploadFile = (e: any) => {
        setImage(URL.createObjectURL(e.target.files[0]));
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const formProps = Object.fromEntries(formData);

        if ((formProps["imageFile"] as File).size == 0) {
            setMessage("Please upload an image.");
            setSeverity("error");
            openSnackBar();
            return;
        }

        const product: Product = {
            name: formProps["name"].toString(),
            detail: formProps["description"].toString(),
            price: Number(formProps["price"].toString()),
        }

        const storageRef = ref(storage, product.name);

        uploadBytes(storageRef, formProps["imageFile"] as File).then(async (snapshot) => {
            console.log('Uploaded a blob or file!');
            try {
                const docRef = await addDoc(collection(firestore, "products"), product);
                console.log("Document written with ID: ", docRef.id);
                setMessage("Successfully uploaded!");
                setSeverity("success");
                handleClose();
                openSnackBar();
            } catch (e) {
                console.log(e);
                setMessage("Failed to upload.");
                setSeverity("error");
                openSnackBar();
            }
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
        <Snackbar
                open={openSnackbar}
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
        <Divider/>
            <Button onClick={handleOpen}>Open modal</Button>
            <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description">
            <Box sx={style}>
            <form onSubmit={handleSubmit} method="post">
                <Stack className="mx-auto w-full" spacing={2} sx={{justifyContent: "center", alignItems: "center"}}>
                    <div className="flex border-2 p-2 w-full">
                        <input
                            type="text"
                            name="name"
                            placeholder="Name"
                            min={0}
                            required={true}
                            className="outline-none w-full pl-1.5"></input>
                    </div>

                    <div className={"mx-auto w-1/2 h-[216px] relative hover:cursor-pointer"} onClick={browseFile}>
                        <input name="imageFile" type='file' ref={imageInputRef} onChange={uploadFile} hidden={true}></input>
                        <Image src={image} alt={"image"} layout='fill' objectFit='contain'/>
                    </div>

                    <div className="flex border-2 p-2 w-full">
                        <span className="my-auto text-base font-normal">$</span>
                        <input
                            type="number"
                            name="price"
                            placeholder="Price"
                            min={0}
                            required={true}
                            className="outline-none w-full pl-1.5"></input>
                    </div>

                    <textarea
                        name="description"
                        maxLength={1024}
                        placeholder="Description"
                        required={true}
                        className="outline-none border-2 w-full h-40 p-2 min-h-12 resize-none"></textarea>

                    <div className="flex w-full">
                        <button className="mx-auto border-2 bg-blue-400 rounded-full w-1/2 h-10 text-white text-xl font-medium hover:bg-blue-500 active:bg-blue-600">Submit</button>
                    </div>
                </Stack>
            </form>
            </Box>
            </Modal>
        <Divider/>
    </div>
);
}