import type {Metadata} from "next";
import "../globals.css";
import NavigationBar from "@/components/navigationbar";
import Footer from "@/components/footer";
import {NextIntlClientProvider, useTranslations} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {routing} from '@/src/i18n/routing';
import {unstable_setRequestLocale} from 'next-intl/server';
import React from "react";

export const metadata: Metadata = {
    title: "Create Next App",
    description: "Generated by create next app"
};

export function generateStaticParams() {
    return routing.locales.map((locale) => ({locale}));
  }

export default async function LocaleLayout({children, params: {locale}} : Readonly < {children: React.ReactNode; params: {locale: string}} >) {
    unstable_setRequestLocale(locale);
    const messages = await getMessages();
    return (
        <>
            <head>
                <link
                    rel="stylesheet"
                    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
                    crossOrigin=""/>
                <script
                    src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
                    integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
                    crossOrigin=""></script>
            </head>
            <html lang={locale}>
                <body>
                    <NextIntlClientProvider messages={messages}>
                        <NavigationBar messages={messages as IntlMessages} params={{locale: locale}}/>
                        {children}
                        <Footer messages={messages as IntlMessages} params={{locale: locale}}/>
                    </NextIntlClientProvider>
                </body>
            </html>
        </>
    );
}