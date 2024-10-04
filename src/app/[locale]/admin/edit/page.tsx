"use client";
import { firestore, storage } from "@/components/firebase";
import { addDoc, collection } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useState, useRef} from "react";
import Divider from "@/components/divider";
import Stack from "@mui/material/Stack";

type Product = {
    name: string;
    detail: string;
    price: number;
};

export default function Edit() {
    const storageRef = ref(storage, "image");

    const [file, setFile] = useState<String>();

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const formProps = Object.fromEntries(formData);

        console.log(formProps["imageFile"])
        console.log(typeof(formProps["imageFile"]))

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
            } catch (e) {
                console.log(e);
            }
        });
    }

    return (
        <div className="main_content_div">
            <Divider/>
            <div className='flex my-10'>
                <div className="text-2xl font-medium mx-auto">Product Name</div>
            </div>

            <div className="">
                <Stack direction="row" className="flex my-10">
                    <div className={"mx-auto w-[284px] h-[284px] bg-red-400"}></div>

                    <Stack className="mx-auto h-[284px] w-[284px]" spacing={8}>
                        <div className="text-2xl font-medium">Price: $1</div>
                        <div className="text-2xl font-medium">Description: test</div>
                    </Stack>
                </Stack>
            </div>

            <div className="flex mt-10">
                <form onSubmit={handleSubmit} className="mx-auto w-1/2" method="post">
                    <div className="flex border-2 p-2 my-4">
                        <span className="my-auto text-base font-normal">$</span>
                        <input
                            type="number"
                            name="price"
                            placeholder="New Price"
                            min={0}
                            className="outline-none w-full pl-1.5"></input>
                    </div>

                    <div className="flex border-2 p-2 my-4">
                        <input
                            type="text"
                            name="name"
                            placeholder="New Name"
                            min={0}
                            className="outline-none w-full pl-1.5"></input>
                    </div>

                    <div className="flex border-2 p-2 my-4">
                        <input name="imageFile" type="file"/>
                    </div>


                    <textarea
                        name="description"
                        maxLength={1024}
                        placeholder="New Description"
                        className="outline-none border-2 w-full p-2 min-h-12 my-4"></textarea>
                        
                    <div className="flex w-full">
                        <button className="mx-auto mt-4 mb-10 border-2 bg-blue-400 rounded-full w-1/2 h-10 text-white text-xl font-medium hover:bg-blue-500 active:bg-blue-600">Submit</button>
                    </div>
                    
                </form>
            </div>
            <Divider/>
        </div>
    );
}