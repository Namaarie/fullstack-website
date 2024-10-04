"use client";
import Image from "next/image";
import {usePathname, useRouter} from '@/src/i18n/routing';

export default function Footer({messages, params: {locale}} : {messages: IntlMessages; params: {locale: string}}) {
    const pathname = usePathname();
    const router = useRouter();
    const swapLocale = () => {
        if (pathname == "/checkout") {
            return;
        } else {
            router.replace(pathname, {locale: locale == "en" ? "fr" : "en"});
        }
        
    }

    return (
        <div className="flex border-x-2 border-b-2 mx-2 mb-2 mt-0">
            <div className="w-80 mt-10 mb-10 mx-auto">
                <div className="mb-10">
                    <span className="font-medium text-2xl">Lorem Ipsum</span>
                </div>
                <div>
                    <p className="font-medium underline text-gray-600 text-justify">Quisque rutrum
                        rutrum elit a tempus nuc finibus sed consectetur eu rhoncus et hendrerit congue
                        lectus</p>
                </div>
            </div>
            <div className="w-0.5 h-40 my-auto border"></div>
            <div className="w-80 mt-10 mb-10 mx-auto">
                <div className="mb-10">
                    <span className="font-medium text-2xl ml-0">Social</span>
                </div>
                <div className="flex m-auto">
                    <a href="https://x.com/home?lang=en" target="_blank">
                        <Image
                            className="block-inline ml-auto mr-2"
                            src={"/twitter.svg"}
                            width={40}
                            height={40}
                            alt={"Search"}/></a>
                    <a href="https://www.instagram.com/" target="_blank">
                        <Image
                            className="block-inline mx-2"
                            src={"/instagram.svg"}
                            width={40}
                            height={40}
                            alt={"Search"}/></a>
                    <a href="https://www.youtube.com/" target="_blank">
                        <Image
                            className="block-inline mx-2"
                            src={"/youtube.svg"}
                            width={40}
                            height={40}
                            alt={"Search"}/></a>
                    <a href="https://www.tiktok.com/en/" target="_blank">
                        <Image
                            className="block-inline mx-2"
                            src={"/tiktok.svg"}
                            width={40}
                            height={40}
                            alt={"Search"}/></a>
                    
                    <Image
                        onClick={swapLocale}
                        className="block-inline mr-auto ml-2 hover:cursor-pointer"
                        src={locale == "en" ? "/fr.svg" : "/en.svg"}
                        width={40}
                        height={40}
                        alt={"Search"}/>
                </div>
            </div>
        </div>
    );
}