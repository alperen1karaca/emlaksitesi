import type { Metadata } from "next";
import { Roboto, Montserrat, Playfair_Display } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";

const roboto = Roboto({ weight: ["300", "400", "500", "700"], subsets: ["latin"], variable: "--font-roboto" });
const montserrat = Montserrat({ weight: ["400", "500", "700", "800", "900"], subsets: ["latin"], variable: "--font-montserrat" });
const playfair = Playfair_Display({ weight: ["400", "600", "700"], subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
    title: "SS Gayrimenkul | Lüks Konut ve Yatırım Danışmanlığı",
    description: "SS Gayrimenkul ile hayalinizdeki eve kavuşun. Sakarya ve çevresinde satılık daire, arsa ve lüks konutlar için profesyonel çözümler.",
};

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import GoogleMap from "@/components/layout/GoogleMap";
import ScrollToTop from "@/components/layout/ScrollToTop";
import FloatingWhatsApp from "@/components/layout/FloatingWhatsApp";
import { AuthProvider } from "@/context/AuthContext";
import { GlobalAtmosphere } from "@/components/common/LineAnimations";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="tr" className={`${roboto.variable} ${montserrat.variable} ${playfair.variable}`}>
            <body className="font-sans bg-background text-foreground antialiased" suppressHydrationWarning>
                <AuthProvider>
                    <GlobalAtmosphere />
                    <header className="fixed top-0 w-full z-[1001]">
                        <Navbar />
                    </header>
                    <main className="min-h-screen pt-[70px]">
                        {children}
                    </main>
                    <GoogleMap />
                    <Footer />
                    <ScrollToTop />
                    <FloatingWhatsApp />
                </AuthProvider>
            </body>
        </html>
    );
}
