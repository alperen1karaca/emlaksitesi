"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Ana Sayfa", href: "/" },
        { name: "Satılık", href: "/ilanlar?type=satilik" },
        { name: "Kiralık", href: "/ilanlar?type=kiralik" },
        { name: "Hakkımızda", href: "/hakkimizda" },
        { name: "İletişim", href: "/iletisim" },
    ];

    return (
        <nav
            className={`w-full transition-all duration-300 border-b ${isScrolled ? "bg-white shadow-lg py-1" : "bg-white py-2"
                } border-gray-100`}
        >
            <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center">
                {/* Left: Logo */}
                <div className="flex-1 flex justify-start">
                    <Link href="/" className="flex items-center gap-2 md:gap-3 group">
                        <img src="/logo.png" alt="SS Gayrimenkul" className="h-10 md:h-14 w-auto object-contain transition-transform group-hover:scale-105" />
                        <span className="text-[#E31E24] font-bold italic uppercase tracking-wider text-sm md:text-xl">GAYRİMENKUL</span>
                    </Link>
                </div>

                {/* Center: Navigation Links */}
                <div className="hidden md:flex flex-1 justify-center">
                    <div className="flex items-center gap-8 text-[11px] font-bold text-secondary uppercase tracking-tight">
                        <Link href="/" className="hover:text-primary transition-colors">Ana Sayfa</Link>
                        <Link href="/hakkimizda" className="hover:text-primary transition-colors">Biz Kimiz</Link>
                        <div className="flex items-center gap-1.5 text-blue-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                            <span>7/24 Destek</span>
                        </div>
                        <Link href="/iletisim" className="hover:text-primary transition-colors">İletişim</Link>
                    </div>
                </div>

                {/* Right: Language/Actions */}
                <div className="flex-1 flex justify-end items-center gap-6">
                    <div className="hidden md:flex items-center gap-2 text-[11px] font-bold text-secondary cursor-pointer hover:text-primary transition-colors">
                        <span className="text-red-500 text-sm">🇹🇷</span> TR
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-secondary hover:text-primary transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-white border-t border-gray-100 overflow-hidden"
                    >
                        <div className="p-6 flex flex-col gap-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="text-lg font-bold text-[#333]"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <hr className="border-gray-100" />
                            <Link
                                href="/admin"
                                className="bg-primary text-white p-4 rounded-md text-center font-bold"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                İlan Ekle
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
