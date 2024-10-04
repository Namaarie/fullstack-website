"use client";
import Divider from '@/components/divider';
import { auth, firestore, storage } from "@/components/firebase";
import { productDisplay, ProductWithID } from '@/components/product_information';
import CloseIcon from '@mui/icons-material/Close';
import { Alert, AlertColor, IconButton, Snackbar, SnackbarCloseReason } from "@mui/material";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import Modal from '@mui/material/Modal';
import Pagination from "@mui/material/Pagination/Pagination";
import Stack from '@mui/material/Stack';
import { getIdToken, getIdTokenResult, onAuthStateChanged, signOut } from 'firebase/auth';
import { addDoc, collection, getDocs } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChangeEvent, Fragment, useEffect, useRef, useState } from 'react';

const placeholderProductWithID: ProductWithID = {
    name: "",
    detail: "",
    price: -1,
    id: null,
    image: "/placeholder.svg",
    price_id: null
}

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

function testSignOut() {
    signOut(auth).then(() => {
        console.log("signed out")
    }).catch((error) => {
        console.log(error)
    })
}

const productsPerPage = 8;

var jwtToken = "";

export default function Products() {
    const router = useRouter();

    onAuthStateChanged(auth, (user) => {
        if (user) {
            getIdToken(user).then((token) => {
                jwtToken = token;
            })

        } else {
            console.log("not authenticated")
            router.push("/admin/login");
            return;
        }
    });

    const [openEdit, setOpenEdit] = useState(false);
    const handleOpenEdit = () => {
        //setImage("/placeholder.svg");
        setOpenEdit(true);
    };
    const handleCloseEdit = () => setOpenEdit(false);

    const [refreshProducts, setRefreshProducts] = useState(0);

    const imageInputRef = useRef<HTMLInputElement>(null);
    const [productInformation, setProductInformation] = useState(placeholderProductWithID);

    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [severity, setSeverity] = useState<AlertColor>("success")
    const [message, setMessage] = useState(" ");
    const [page, changePage] = useState(1);
    const [products, setProducts] = useState<ProductWithID[]>([]);
    const [focusedProduct, setFocusedProduct] = useState<ProductWithID>();
    const [numProducs, setNumProducts] = useState(0);
    const imageDisplayRef = useRef<HTMLImageElement>(null);

    const updateFocusedProduct = (product: ProductWithID) => {
        setFocusedProduct(structuredClone(product));
    }

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

    const submitFile = (e: any) => {
        var newProduct = structuredClone(productInformation);
        newProduct.image = URL.createObjectURL(e.target.files[0])
        setProductInformation(newProduct);
    }

    const handleImageClicked = (product: ProductWithID) => {
        updateFocusedProduct(product);
        setProductInformation(product);
        handleOpenEdit();
    }

    const updatePriceDisplay = (change: ChangeEvent<HTMLInputElement>) => {
        change.target.value = productDisplay.price_to_decimal_without_symbol(Number(change.target.value) * 100);
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const formProps = Object.fromEntries(formData);

        console.log(imageDisplayRef.current?.src);

        if (imageDisplayRef.current?.src == "http://localhost:3000/placeholder.svg") {
            // has to be no images 
            setMessage("Please upload an image.");
            setSeverity("error");
            openSnackBar();
            return;
        }

        const product = {
            name: formProps["name"].toString(),
            description: formProps["description"].toString(),
            price: Number(formProps["price"].toString()) * 100,
            price_id: focusedProduct!.price_id,
            image_url: focusedProduct?.image,
            id: focusedProduct!.id,
            token: jwtToken
        }

        // maybe can use random unique name in future?
        const storageRef = ref(storage, product.name);

        if ((formProps["imageFile"] as File).size != 0){
            // upload image to firebase cloud storage
            await uploadBytes(storageRef, formProps["imageFile"] as File).then(async (snapshot) => {
                console.log('Uploaded a blob or file!');
                // get reference to image
                const ref = snapshot.ref;
                // get image url
                await getDownloadURL(ref).then((url) => {
                    // set image url
                    product.image_url = url;
                });
            });
        }

        // add product to stripe using backend
        fetch("http://localhost:5000/create_product", {
            method: "POST",
            body: JSON.stringify(product),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        }).then((res) => {
            if (res.ok) {
                setMessage("Successfully uploaded!");
                setSeverity("success");
                setRefreshProducts(refreshProducts + 1);
                handleCloseEdit();
                openSnackBar();
            } else {
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

    useEffect(() => {
        setProducts([]);
        productDisplay.get_products((page-1)*productsPerPage, ((page-1)*productsPerPage)+productsPerPage).then((products) => {
            setProducts(products);
        })
        /*
        getDocs(collection(firestore, "products")).then((querySnapshot) => {
            setNumProducts(querySnapshot.docs.length);
            var paginatedDocs = querySnapshot.docs.slice((page-1)*productsPerPage, ((page-1)*productsPerPage)+productsPerPage)
            var promises: Promise<string>[] = []

            var p = paginatedDocs.map((doc) => {
                var product: ProductWithID = {
                    name: doc.data()["name"],
                    detail: doc.data()["detail"],
                    price: doc.data()["price"],
                    id: doc.id,
                    image: "",
                }
                return product;
            });

            p.forEach(product => {
                promises.push(getDownloadURL(ref(storage, product.name)))
            });

            Promise.all(promises).then((urls) => {
                for (var i = 0; i < urls.length; i++) {
                    p[i].image = urls[i];
                }
                setProducts(p);
            });
        });
        */
    }, [refreshProducts, page])
    
    function populateImages() {
        return <ImageList sx={{ width: 632, height: "auto" }} cols={3} className='mx-auto'>
                    <ImageListItem className='flex w-[200px] h-[200px]' >
                        <Image
                            src={"/add.svg"}
                            width={200}
                            height={200}
                            onClick={() => handleImageClicked(placeholderProductWithID)}
                            className='hover:cursor-pointer'
                            alt={"Add"}/>
                        <ImageListItemBar title={"Add Product"} position="below" className='mx-auto'/>
                    </ImageListItem>
                    {products.map((product) => (
                        <ImageListItem className='flex w-[200px] h-[200px]' key={product.id}>
                            <Image
                                src={product.image}
                                width={200}
                                height={200}
                                alt={product.detail}
                                onClick={() => {handleImageClicked(product)}}
                                />

                            <ImageListItemBar title={product.name} position="below" className='mx-auto'/>
                        </ImageListItem>

                    ))}
                </ImageList>
    }

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
            <Modal
            open={openEdit}
            onClose={handleCloseEdit}
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
                            defaultValue={productInformation.name}
                            required={true}
                            className="outline-none w-full pl-1.5"></input>
                    </div>

                    <div className={"mx-auto w-1/2 h-[216px] relative hover:cursor-pointer"} onClick={browseFile}>
                        <input name="imageFile" type='file' ref={imageInputRef} onChange={submitFile} hidden={true}></input>
                        <Image ref={imageDisplayRef} src={productInformation.image} alt={"image"} width={1000} height={1000} style={{ width: '100%', height: 'auto' }}/>
                    </div>

                    <div className="flex border-2 p-2 w-full">
                        <span className="my-auto text-base font-normal">$</span>
                        <input
                            type="number"
                            name="price"
                            placeholder="Price"
                            min={0}
                            required={true}
                            defaultValue={productDisplay.price_to_decimal_without_symbol(productInformation.price)}
                            onChange={updatePriceDisplay}
                            className="outline-none w-full pl-1.5"></input>
                    </div>

                    <textarea
                        name="description"
                        maxLength={1024}
                        placeholder="Description"
                        required={true}
                        defaultValue={productInformation.detail}
                        className="outline-none border-2 w-full h-40 p-2 min-h-12 resize-none"></textarea>

                    <div className="flex w-full">
                        <button className="mx-auto border-2 bg-blue-400 rounded-full w-1/2 h-10 text-white text-xl font-medium hover:bg-blue-500 active:bg-blue-600">Submit</button>
                    </div>
                </Stack>
            </form>
            </Box>
            </Modal>
            <Divider/>
                <div className='flex my-10'>
                    <div className="text-2xl font-medium mx-auto" onClick={testSignOut}>Products</div>
                </div>
                {populateImages()}
                <div className='flex'>
                    <Pagination className="mx-auto my-10" count={Math.ceil(numProducs/productsPerPage)} onChange={(e: any, newPage: number) => {changePage(newPage)}}/>
                </div>

            <Divider/>
        </div>
    );
}