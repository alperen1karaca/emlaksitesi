import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "SS Gayrimenkul | Lüks Konut ve Yatırım Danışmanlığı",
    description: "SS Gayrimenkul ile hayalinizdeki eve kavuşun. Sakarya ve çevresinde satılık daire, arsa ve lüks konutlar için profesyonel çözümler.",
};

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CurrencyTicker from "@/components/layout/CurrencyTicker";
import GoogleMap from "@/components/layout/GoogleMap";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="tr">
            <body className={inter.className}>
                <header className="fixed top-0 w-full z-50">
                    <CurrencyTicker />
                    <Navbar />
                </header>
                <main className="min-h-screen pt-[100px]">
                    {children}
                </main>
                <GoogleMap />
                <Footer />
            </body>
        </html>
    );
}
