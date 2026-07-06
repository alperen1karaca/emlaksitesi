"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import { Menu, X, User, LogOut, LayoutDashboard, UserCircle, Heart, Plus, ChevronDown, Shield, FileText, Lock, Cookie, Megaphone, AlertTriangle, Camera, Video, TrendingUp, Share2, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [mobileOpenSection, setMobileOpenSection] = useState<string | null>(null);
    const { user, isAdmin, logout } = useAuth();
    const [pendingListingsCount, setPendingListingsCount] = useState(0);
    const [newMessagesCount, setNewMessagesCount] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Real-time notifications for Admin
    useEffect(() => {
        if (!isAdmin) {
            setPendingListingsCount(0);
            setNewMessagesCount(0);
            return;
        }

        // Listen for pending listings
        const qListings = query(
            collection(db, "listings"),
            where("status", "==", "pending")
        );
        const unsubscribeListings = onSnapshot(qListings, (snapshot) => {
            setPendingListingsCount(snapshot.size);
        });

        // Listen for new messages
        const qMessages = query(
            collection(db, "contact_messages"),
            where("status", "==", "NEW")
        );
        const unsubscribeMessages = onSnapshot(qMessages, (snapshot) => {
            setNewMessagesCount(snapshot.size);
        });

        return () => {
            unsubscribeListings();
            unsubscribeMessages();
        };
    }, [isAdmin]);

    const totalNotifications = pendingListingsCount + newMessagesCount;

    interface SubItem {
        name: string;
        href: string;
        icon?: any;
        description?: string;
    }

    interface NavLink {
        name: string;
        href: string;
        subItems?: SubItem[];
    }

    const navLinks: NavLink[] = [
        { name: "Ana Sayfa", href: "/" },
        {
            name: "İlanlar",
            href: "/ilanlar",
            subItems: [
                { name: "Satılık İlanlar", href: "/ilanlar?type=satilik", description: "Hayalinizdeki gayrimenkulü satın alın" },
                { name: "Kiralık İlanlar", href: "/ilanlar?type=kiralik", description: "Size uygun kiralık portföyler" },
            ]
        },
        {
            name: "Hizmetlerimiz",
            href: "/hizmetlerimiz",
            subItems: [
                { name: "4K Drone Çekimi", href: "/hizmetlerimiz#drone", icon: Camera },
                { name: "Sinematik Video", href: "/hizmetlerimiz#video", icon: Video },
                { name: "Dopingli İlan", href: "/hizmetlerimiz#doping", icon: TrendingUp },
                { name: "Sosyal Medya", href: "/hizmetlerimiz#sosyal", icon: Share2 },
            ]
        },
        { name: "Biz Kimiz", href: "/hakkimizda" },
        { name: "İletişim", href: "/iletisim" },
        {
            name: "Yasal",
            href: "/yasal-bilgiler",
            subItems: [
                { name: "KVKK", href: "/yasal-bilgiler#kvkk", icon: Shield },
                { name: "Kullanım Koşulları", href: "/yasal-bilgiler#kullanim-kosullari", icon: FileText },
                { name: "Gizlilik", href: "/yasal-bilgiler#gizlilik", icon: Lock },
                { name: "Çerezler", href: "/yasal-bilgiler#cerez", icon: Cookie },
                { name: "İlan Kuralları", href: "/yasal-bilgiler#ilan", icon: Megaphone },
                { name: "Sorumluluk Reddi", href: "/yasal-bilgiler#sorumluluk", icon: AlertTriangle },
            ]
        },
    ];

    const tickerServices = [
        "4K DRONE ÇEKİMİ",
        "SİNEMATİK VİDEO",
        "GELİŞMİŞ PAZARLAMA",
        "DOPİNGLİ İLAN YÖNETİMİ",
        "SOSYAL MEDYA DANIŞMANLIĞI",
        "PROFESYONEL FOTOĞRAF",
        "DEĞERİNDE EKSPERTİZ",
        "ÜCRETSİZ DANIŞMANLIK"
    ];

    return (
        <>


            <nav
                className={`w-full relative z-[100] transition-all duration-300 border-b flex flex-col ${isScrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-white"
                    } border-neutral-100`}
            >
            {/* Ticker Section */}
            <div className="w-full bg-neutral-900 text-white overflow-hidden flex items-center h-8 relative z-50">
                <motion.div
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
                    className="flex whitespace-nowrap w-max"
                >
                    {/* Render the array 4 times to guarantee it overflows the screen completely and loops seamlessly */}
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center">
                            {tickerServices.map((service, index) => (
                                <div key={`${i}-${index}`} className="flex items-center">
                                    <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] px-4">
                                        {service}
                                    </span>
                                    <span className="text-[#E10600] text-xs px-2">•</span>
                                </div>
                            ))}
                        </div>
                    ))}
                </motion.div>
            </div>

            <div className={`max-w-[1400px] w-full mx-auto px-2 md:px-6 h-16 flex items-center relative gap-2 transition-all duration-300 ${isScrolled ? "py-1" : "py-2"}`}>
                {/* Mobile Menu Toggle (Left on Mobile) - Minimalist Animated Hamburger */}
                <button
                    className="lg:hidden relative z-[1100] p-2 w-10 h-10 flex flex-col items-center justify-center gap-[6px] shrink-0 group"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    <motion.span
                        animate={isMobileMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                        className="w-6 h-[2px] bg-black block transition-colors group-hover:bg-[#E10600]"
                    />
                    <motion.span
                        animate={isMobileMenuOpen ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
                        className="w-6 h-[2px] bg-black block transition-colors group-hover:bg-[#E10600]"
                    />
                    <motion.span
                        animate={isMobileMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                        className="w-6 h-[2px] bg-black block transition-colors group-hover:bg-[#E10600]"
                    />
                </button>
                {/* Left/Center: Logo */}
                <div className="absolute left-1/2 -translate-x-1/2 lg:relative lg:left-0 lg:translate-x-0 lg:flex-1 lg:flex lg:justify-start">
                    <Link href="/" className="flex items-center gap-2 md:gap-3 group">
                        <img src="/logo.png" alt="SS Gayrimenkul" className="h-9 md:h-14 w-auto object-contain transition-transform group-hover:scale-105" />
                        <span className="text-[#E10600] font-heading font-black italic uppercase tracking-wider text-[10px] md:text-xl whitespace-nowrap">GAYRİMENKUL</span>
                    </Link>
                </div>

                {/* Center: Navigation Links (Desktop) */}
                <div className="hidden lg:flex flex-[2] justify-center items-center">
                    <div className="flex items-center gap-6 text-[10px] font-heading font-bold text-black uppercase tracking-widest">
                        {navLinks.map((link) => (
                            <div
                                key={link.name}
                                className="relative group py-6"
                                onMouseEnter={() => link.subItems && setActiveDropdown(link.name)}
                                onMouseLeave={() => setActiveDropdown(null)}
                            >
                                <Link
                                    href={link.href}
                                    className="flex items-center gap-1.5 hover:text-[#E10600] transition-all duration-300"
                                >
                                    {link.name}
                                    {link.subItems && (
                                        <ChevronDown
                                            size={12}
                                            className={`transition-transform duration-300 ${activeDropdown === link.name ? "rotate-180" : ""}`}
                                        />
                                    )}
                                </Link>

                                {/* Desktop Dropdown */}
                                <AnimatePresence>
                                    {link.subItems && activeDropdown === link.name && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 15 }}
                                            className="absolute top-full left-1/2 -translate-x-1/2 w-64 bg-white rounded-2xl shadow-xl border border-neutral-100 p-2"
                                        >
                                            <div className="grid grid-cols-1 gap-1">
                                                {link.subItems.map((sub) => {
                                                    const Icon = sub.icon;
                                                    return (
                                                        <Link
                                                            key={sub.name}
                                                            href={sub.href}
                                                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group/sub"
                                                        >
                                                            {Icon && (
                                                                <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary group-hover/sub:bg-primary group-hover/sub:text-white transition-colors">
                                                                    <Icon size={16} />
                                                                </div>
                                                            )}
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] font-heading font-bold text-black uppercase tracking-wider">{sub.name}</span>
                                                                {sub.description && (
                                                                    <span className="text-[9px] text-neutral-400 normal-case font-medium">{sub.description}</span>
                                                                )}
                                                            </div>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex-1 flex justify-end items-center gap-4">
                    <Link
                        href={user ? "/ilan-ver" : "/register"}
                        className="hidden sm:flex items-center gap-2 bg-[#E10600] text-white px-5 py-2.5 rounded-xl text-[10px] font-heading font-bold uppercase tracking-widest hover:bg-black transition-all shadow-md"
                    >
                        <Plus size={14} />
                        İlan Ver
                    </Link>

                    {user ? (
                        <div className="relative">
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="relative flex items-center gap-2 bg-white border border-neutral-400 text-black px-4 py-2.5 rounded-xl text-[10px] font-heading font-bold uppercase tracking-widest hover:border-black transition-all shadow-sm"
                            >
                                <UserCircle size={16} />
                                <span className="hidden xl:inline">{user.displayName || "Hesabım"}</span>
                                {isAdmin && totalNotifications > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#E10600] text-white text-[10px] rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                                        {totalNotifications}
                                    </span>
                                )}
                            </button>

                            <AnimatePresence>
                                {isUserMenuOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute right-0 mt-3 w-56 bg-white border border-neutral-100 rounded-2xl shadow-xl p-2 z-[110]"
                                    >
                                        {isAdmin && (
                                            <>
                                                <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-black uppercase tracking-widest hover:bg-neutral-100 rounded-xl transition-colors" onClick={() => setIsUserMenuOpen(false)}>
                                                    <LayoutDashboard size={14} /> Yönetim Paneli
                                                </Link>
                                                <Link href="/admin/basvurular" className="flex items-center justify-between px-4 py-3 hover:bg-neutral-100 rounded-xl transition-colors group" onClick={() => setIsUserMenuOpen(false)}>
                                                    <div className="flex items-center gap-3 text-[11px] font-bold text-black uppercase tracking-widest">
                                                        <Plus size={14} /> İlan Başvuruları
                                                    </div>
                                                    {pendingListingsCount > 0 && (
                                                        <span className="bg-[#E10600] text-white text-[10px] px-2 py-0.5 rounded-full font-black">
                                                            {pendingListingsCount}
                                                        </span>
                                                    )}
                                                </Link>
                                                <Link href="/admin/destek" className="flex items-center justify-between px-4 py-3 hover:bg-neutral-100 rounded-xl transition-colors group" onClick={() => setIsUserMenuOpen(false)}>
                                                    <div className="flex items-center gap-3 text-[11px] font-bold text-black uppercase tracking-widest">
                                                        <MessageSquare className="w-3.5 h-3.5" /> Destek Talepleri
                                                    </div>
                                                    {newMessagesCount > 0 && (
                                                        <span className="bg-[#E10600] text-white text-[10px] px-2 py-0.5 rounded-full font-black text-center">
                                                            {newMessagesCount}
                                                        </span>
                                                    )}
                                                </Link>
                                            </>
                                        )}
                                        <Link href="/favorilerim" className="flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-black uppercase tracking-widest hover:bg-neutral-100 rounded-xl transition-colors" onClick={() => setIsUserMenuOpen(false)}>
                                            <Heart size={14} /> Favorilerim
                                        </Link>
                                        <Link href="/profil" className="flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-black uppercase tracking-widest hover:bg-neutral-100 rounded-xl transition-colors" onClick={() => setIsUserMenuOpen(false)}>
                                            <UserCircle size={14} /> Hesabım
                                        </Link>
                                        <button onClick={async () => { await logout(); setIsUserMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-bold text-[#E10600] uppercase tracking-widest hover:bg-neutral-100 rounded-xl transition-colors">
                                            <LogOut size={14} /> Çıkış Yap
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="hidden sm:flex items-center gap-2">
                            <Link href="/login" className="text-[10px] font-heading font-bold text-neutral-800 uppercase tracking-widest px-4 py-2.5 hover:text-black transition-all">
                                Giriş Yap
                            </Link>
                            <Link href="/register" className="bg-black text-white px-6 py-2.5 rounded-xl text-[10px] font-heading font-bold uppercase tracking-widest hover:bg-[#2B2B2B] transition-all shadow-md">
                                Kayıt Ol
                            </Link>
                        </div>
                    )}

                    {/* Removed redundant desktop menu button */}
                </div>
            </div>

        </nav>

            {/* Mobile Menu - Premium Full Screen Overlay (Now at the end to ensure it's on top) */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        key="mobile-menu-overlay-final"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-[99999] lg:hidden flex flex-col bg-white overflow-hidden"
                        style={{ backgroundColor: "#FFFFFF", opacity: 1 }}
                    >
                        {/* Mobile Menu Header */}
                        <div className="h-16 flex items-center justify-between px-6 border-b border-neutral-100 flex-shrink-0 bg-white" style={{ backgroundColor: "#FFFFFF" }}>
                            <Link href="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                                <img src="/logo.png" alt="SS Gayrimenkul" className="h-9 w-auto object-contain" />
                                <span className="text-[#E10600] font-heading font-black italic uppercase tracking-wider text-[10px]">GAYRİMENKUL</span>
                            </Link>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 text-black hover:text-[#E10600]"
                                aria-label="Kapat"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-8 py-10 bg-white" style={{ backgroundColor: "#FFFFFF" }}>
                            <motion.div
                                initial="closed"
                                animate="open"
                                variants={{
                                    open: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
                                    closed: { transition: { staggerChildren: 0.05, staggerDirection: -1 } }
                                }}
                                className="flex flex-col gap-8"
                            >
                                {navLinks.map((link) => (
                                    <motion.div
                                        key={link.name}
                                        variants={{
                                            open: { opacity: 1, x: 0 },
                                            closed: { opacity: 0, x: -10 }
                                        }}
                                        className="flex flex-col"
                                    >
                                        <div
                                            className="flex items-center justify-between group"
                                            onClick={() => link.subItems ? setMobileOpenSection(mobileOpenSection === link.name ? null : link.name) : setIsMobileMenuOpen(false)}
                                        >
                                            <Link
                                                href={link.href}
                                                className="text-2xl font-heading font-black text-black uppercase tracking-tighter hover:text-[#E10600] transition-colors"
                                                onClick={(e) => link.subItems && e.preventDefault()}
                                            >
                                                {link.name}
                                            </Link>
                                            {link.subItems && (
                                                <ChevronDown
                                                    size={24}
                                                    className={`text-neutral-300 transition-transform duration-500 ${mobileOpenSection === link.name ? "rotate-180 text-[#E10600]" : ""}`}
                                                />
                                            )}
                                        </div>

                                        {link.subItems && (
                                            <AnimatePresence mode="wait">
                                                {mobileOpenSection === link.name && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="pt-6 pb-2 pl-4 flex flex-col gap-4">
                                                            {link.subItems.map((sub) => (
                                                                <Link
                                                                    key={sub.name}
                                                                    href={sub.href}
                                                                    className="text-sm font-heading font-bold text-neutral-400 uppercase tracking-widest hover:text-black transition-colors"
                                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                                >
                                                                    {sub.name}
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        )}
                                    </motion.div>
                                ))}

                                <motion.div
                                    variants={{
                                        open: { opacity: 1, y: 0 },
                                        closed: { opacity: 0, y: 10 }
                                    }}
                                    className="mt-12 flex flex-col gap-4 pb-12"
                                >
                                    {!user ? (
                                        <div className="flex flex-col gap-4">
                                            <Link
                                                href="/ilan-ver"
                                                className="w-full bg-[#E10600] text-white p-5 rounded-2xl text-center text-xs font-heading font-black uppercase tracking-[0.2em] shadow-xl shadow-[#E10600]/20 flex items-center justify-center gap-3 active:scale-95 transition-all"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <Plus size={18} /> İlan Ver
                                            </Link>
                                            <div className="grid grid-cols-2 gap-4">
                                                <Link href="/login" className="bg-neutral-100 text-black p-5 rounded-2xl text-center text-[10px] font-heading font-bold uppercase tracking-widest active:scale-95 transition-all" onClick={() => setIsMobileMenuOpen(false)}>Giriş Yap</Link>
                                                <Link href="/register" className="bg-black text-white p-5 rounded-2xl text-center text-[10px] font-heading font-bold uppercase tracking-widest active:scale-95 transition-all" onClick={() => setIsMobileMenuOpen(false)}>Kayıt Ol</Link>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-4">
                                            <Link
                                                href="/ilan-ver"
                                                className="w-full bg-[#E10600] text-white p-5 rounded-2xl text-center text-xs font-heading font-black uppercase tracking-[0.2em] shadow-xl shadow-[#E10600]/20 flex items-center justify-center gap-3 active:scale-95 transition-all"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                <Plus size={18} /> İlan Ver
                                            </Link>
                                            <button
                                                onClick={async () => { await logout(); setIsMobileMenuOpen(false); }}
                                                className="w-full bg-red-50 text-[#E10600] p-5 rounded-2xl text-center text-[10px] font-heading font-bold uppercase tracking-widest active:scale-95 transition-all"
                                            >
                                                Çıkış Yap
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
    </>
);
}
