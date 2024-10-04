"use client";

import Image from "next/image";
import { Link } from '@/src/i18n/routing';
import {useEffect, useRef, useState} from "react";
import {usePathname} from '@/src/i18n/routing'
import {AbstractIntlMessages, NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';

const navigation_icon_class = "block-inline w-48 flex hover:underline hover:decoration-blue-500 hover:pointer" +
        " decoration-2 underline-offset-8";

const navigation_icon_focused_page_class = "block-inline w-48 flex underline decoration-blue-500 hover:pointer decoration-" +
        "2 underline-offset-8";

function SearchButton() {
    const search_bar = useRef<HTMLDivElement>(null);
    const [is_search_active, SetSearch] = useState(false);

    const [search_text, SetSearchText] = useState("");

    const UpdateSearchText = (e : any) => {
        SetSearchText(e.target.value);
    }

    const DisableSearch = (e : any) => {
        if (
            is_search_active && !search_bar.current
                ?.contains(e.target)
        ) {
            SetSearch(false)
        }
    }

    useEffect(() => {
        document.addEventListener("mousedown", DisableSearch)
    })
    

    if (is_search_active) {
        return (< div ref = {search_bar} className = "block-inline m-auto mr-0 w-[200px]"> 
                    <input className = "rounded-full p-2 border outline-none" 
                        type = "text" 
                        placeholder = "Search..." 
                        autoFocus = {true}
                        value = {search_text}
                        onChange = {UpdateSearchText}/> 
                    </div>
                );
    } else {
        return (
            < div className = "block-inline my-auto mr-0 ml-auto hover:cursor-pointer" onClick = {
                () => SetSearch(true)
            } > <Image className = "m-auto p-4 pl-40 search_icon" src = {
                "/search.svg"
            }
            width = {
                200
            }
            height = {
                50
            }
            alt = {
                "Search"
            } /> </div>
        );
    }
}

export default function NavigationBar({messages, params: {locale}} : {messages: IntlMessages; params: {locale: string}}) {
    var path_name = usePathname();
    return (
        <div className="flex h-20 border-x-2 border-t-2 mt-2 mx-2 mb-0">
            <div className="block-inline flex mr-auto"> 
                <Link href="/home" className="flex">
                <Image className="px-4 logo_icon m-auto my-auto" src="/next.svg" width={120} height={100} alt="Icon"/></Link>
            </div>

            <div className="block-inline flex">
                <Link href="/home" className={path_name == "/home" ? navigation_icon_focused_page_class : navigation_icon_class}> 
                    <div className="m-auto">{messages.Navigation.Home}</div>
                </Link> 
                
                <Link href = "/products" className = {path_name == "/products" ? navigation_icon_focused_page_class : navigation_icon_class}>
                    <div className="m-auto">{messages.Navigation.Products}</div>
                </Link>

                <Link href = "/support" className = {path_name == "/support" ? navigation_icon_focused_page_class : navigation_icon_class}>
                    <div className="m-auto">{messages.Navigation.Support}</div>
                </Link>

                <Link href = "/contact" className = {path_name == "/contact" ? navigation_icon_focused_page_class : navigation_icon_class}>
                    <div className="m-auto">{messages.Navigation.Contact}</div>
                </Link>
            </div>

            <SearchButton/>
        </div>
    );
}