"use client";
import Divider from "@/components/divider"
import { firestore, storage } from "@/components/firebase";
import Stack from "@mui/material/Stack"
import { collection, getDocs, limit, query } from "firebase/firestore";
import { useEffect, useRef, useState } from "react"
import Image from 'next/image';
import { getDownloadURL, ref } from "firebase/storage";
import { productDisplay, ProductWithID } from "@/components/product_information";
import { useRouter } from 'next/navigation';

// floored division modulo
function mod(n: number, m: number) {
    return ((n % m) + m) % m;
}

export default function Products() {
    const scroll_ref = useRef<HTMLInputElement>(null);
    const [focusedProductInformation, setFocusedProductInformation] = useState<ProductWithID>();
    const [products, setProducts] = useState<ProductWithID[]>([]);
    const productLimit = 9;
    const horizontalScrollWidth = productLimit * 300
    const router = useRouter();

    const updateFocusedProduct = (product: ProductWithID) => {
        setFocusedProductInformation(structuredClone(product));
    }

    useEffect(() => {
        function updateScrollPosition(event: WheelEvent) {
            event.preventDefault();
            var new_pos = scroll_ref.current!.scrollLeft - Math.sign(event.deltaY) * 100;
            scroll_ref.current!.scrollLeft = mod(new_pos, horizontalScrollWidth);
        }

        if (scroll_ref && scroll_ref.current) {
            scroll_ref.current.scrollLeft = 0;
            scroll_ref.current.addEventListener("wheel", updateScrollPosition, false);
        };
    }, []);

    useEffect(() => {
        var sets = 1;

        setProducts([]); 
        productDisplay.get_products(0, productLimit).then((products) => {
            setProducts(products);
            updateFocusedProduct(products[0]);
        })
        /*
        const productsRef = collection(firestore, "products");
        const q = query(productsRef, limit(productLimit));
        setProducts([]);
        getDocs(q).then((querySnapshot) => {
            for (var j = 0; j < sets; j++) {
                querySnapshot.forEach((doc) => {
                    var product: ProductWithID = {
                        name: doc.data()["name"],
                        detail: doc.data()["detail"],
                        price: doc.data()["price"],
                        id: doc.id,
                        image: "",
                        set: j
                    }
    
                    getDownloadURL(ref(storage, product.name)).then((url) => {
                        product.image = url;
                        setProducts(oldProducts => [...oldProducts, ...[product]]);
                    });
                });
            };
            var product: ProductWithID = {
                name: querySnapshot.docs[0].data()["name"],
                detail: querySnapshot.docs[0].data()["detail"],
                price: querySnapshot.docs[0].data()["price"],
                id: querySnapshot.docs[0].id,
                image: "",
                set: 0
            }
    
            getDownloadURL(ref(storage, product.name)).then((url) => {
                product.image = url;
            }).then(() => {
                updateFocusedProduct(product);
            });
        });
        */
    }, [])

    function populateImages() {
        return <Stack ref={scroll_ref} direction="row" spacing={"16px"} className="overflow-x-auto horizontal-scroll my-10">
            {products.map((product) => (
                <div key={product.id} onClick={() => {updateFocusedProduct(product)}} className={"w-[284px] h-[284px] horizontal-scroll-item"}>
                    <Image src={product.image} alt={"image"} width={300} height={300}/>
                </div>
            ))}
        </Stack>
    }

    const clickedProduct = function () {
        //console.log(focusedProductInformation);
        router.push(`./checkout?price_id=${focusedProductInformation?.price_id}`);
    }

    const focusedProduct = function () {
        return (
            <Stack direction="row" className="flex my-10">
                <div className={"mx-auto w-[284px] h-[284px] flex"}>
                    <Image className={"bg-contain h-full w-auto mx-auto"} onClick={clickedProduct} src={focusedProductInformation?.image||"/placeholder.svg"} alt={"image"} width={300} height={300}/>
                </div>

                <Stack className="mx-auto h-[284px] w-[284px]">
                    <div className="text-2xl font-medium">{focusedProductInformation?.name}</div>
                    <div className="my-auto">{focusedProductInformation?.detail}</div>
                    <div className="my-auto">{productDisplay.price_to_decimal(focusedProductInformation?.price||-1)}</div>
                    <div className="my-auto">Details 3</div>
                </Stack>
            </Stack>
        );
    }

    return <div className="main_content_div">
        <Divider/>
            {populateImages()}
        <Divider/>
            {focusedProduct()}
        <Divider/>
    </div>
}