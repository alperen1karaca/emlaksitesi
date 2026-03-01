"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Search, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import ListingCard from "@/components/listings/ListingCard";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { Listing } from "@/types/listing";
import { motion, AnimatePresence } from "framer-motion";

import HeroSlider from "@/components/home/HeroSlider";
import { HeroSlide } from "@/types/listing";

export default function Home() {
    const [activeTab, setActiveTab] = useState("hepsi");
    const [activeCategory, setActiveCategory] = useState("HEPSİ");
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [slides, setSlides] = useState<HeroSlide[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchSlides = async () => {
            try {
                const q = query(collection(db, "hero_slides"), orderBy("order", "asc"));
                const querySnapshot = await getDocs(q);
                const slidesData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as HeroSlide[];
                setSlides(slidesData);
            } catch (err) {
                console.error("Slides fetch error:", err);
            }
        };

        const fetchListings = async () => {
            try {
                const q = query(
                    collection(db, "listings"),
                    orderBy("createdAt", "desc"),
                    limit(40)
                );
                const querySnapshot = await getDocs(q);
                const items = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Listing[];

                // Robust Randomization (Fisher-Yates)
                const shuffleArray = (array: any[]) => {
                    const shuffled = [...array];
                    for (let i = shuffled.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                    }
                    return shuffled;
                };

                setListings(shuffleArray(items));
            } catch (error) {
                console.error("Hata:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSlides();
        fetchListings();
    }, []);

    // Actual filtering logic
    const filteredListings = listings.filter(l => {
        const matchesTab = activeTab === "hepsi" || l.type.toLowerCase() === activeTab.toLowerCase();
        const matchesCategory = activeCategory === "HEPSİ" || l.category.toUpperCase() === activeCategory.toUpperCase();
        return matchesTab && matchesCategory;
    }).slice(0, 12);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = current.clientWidth * 0.8;
            current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const counts = {
        KONUT: listings.filter(l => l.category === "KONUT").length,
        OFİS: listings.filter(l => l.category === "OFİS").length,
        ARSA: listings.filter(l => l.category === "ARSA").length,
        TOTAL: listings.length
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white text-secondary selection:bg-primary/20"
        >
            {/* Hero Slider Section */}
            <section className={`relative ${slides.length > 0 ? "h-[600px] md:h-[800px]" : "py-20 md:py-32 bg-gray-50/50"} w-full overflow-hidden transition-all duration-700`}>
                <HeroSlider slides={slides} />

                {/* Search & Filters Overlay */}
                <div className={`${slides.length > 0
                    ? "absolute inset-0 z-30 flex flex-col items-center justify-end pb-24 px-6 pointer-events-none"
                    : "relative z-30 flex flex-col items-center px-6"
                    }`}>
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, delay: slides.length > 0 ? 1 : 0.2 }}
                        className="max-w-[1400px] w-full pointer-events-auto"
                    >
                        {/* Stats Summary */}
                        <div className="flex justify-center mb-4 md:mb-6">
                            <div className="bg-black/20 backdrop-blur-md border border-white/10 px-4 md:px-6 py-2 rounded-full flex items-center gap-4 md:gap-8 text-[10px] md:text-[11px] font-black tracking-widest text-white/90">
                                <div className="flex items-center gap-2">
                                    <span className="text-primary">●</span>
                                    <span>{counts.KONUT} KONUT</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-secondary">●</span>
                                    <span>{counts.OFİS} OFİS</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-blue-500">●</span>
                                    <span>{counts.ARSA} ARSA</span>
                                </div>
                                <div className="hidden md:flex items-center gap-2 border-l border-white/10 pl-8 ml-2">
                                    <span className="text-white/40">TOPLAM</span>
                                    <span className="text-white">{counts.TOTAL} İLAN</span>
                                </div>
                            </div>
                        </div>

                        {/* Filters Section */}
                        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-6 md:mb-8">
                            <div className="w-full md:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0 px-4 md:px-0">
                                <div className="flex flex-nowrap md:flex-row items-center justify-start md:justify-center gap-4 min-w-max">
                                    <div className="bg-white/90 backdrop-blur-md p-1 rounded-full border border-white/20 flex items-center shadow-2xl">
                                        {["hepsi", "satilik", "kiralik"].map((tab) => (
                                            <button
                                                key={tab}
                                                onClick={() => setActiveTab(tab)}
                                                className={`px-4 md:px-8 py-2 md:py-3 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] transition-all duration-300 ${activeTab === tab
                                                    ? "bg-primary text-white shadow-lg shadow-primary/30 scale-105"
                                                    : "text-secondary/60 hover:text-secondary"
                                                    }`}
                                            >
                                                {tab === "hepsi" ? "HEPSİ" : tab === "satilik" ? "SATILIK" : "KİRALIK"}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="bg-white/90 backdrop-blur-md p-1 rounded-full border border-white/20 flex items-center shadow-2xl">
                                        {["HEPSİ", "KONUT", "OFİS", "ARSA"].map((cat) => (
                                            <button
                                                key={cat}
                                                onClick={() => setActiveCategory(cat)}
                                                className={`px-4 md:px-8 py-2 md:py-3 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] transition-all duration-300 ${activeCategory === cat
                                                    ? "bg-secondary text-white shadow-lg shadow-black/30 scale-105"
                                                    : "text-secondary/60 hover:text-secondary"
                                                    }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Remax Style Capsule Search Bar */}
                        <div className="max-w-3xl mx-auto shadow-2xl rounded-full border border-white/20 p-1 bg-white flex items-center mx-4 md:mx-auto">
                            <div className="flex-1 px-4 md:px-6 flex items-center gap-2 md:gap-3">
                                <Search size={16} className="text-blue-600 shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Aradığınız ilanı yazın..."
                                    className="w-full py-3 md:py-4 bg-transparent border-none outline-none text-secondary font-bold text-sm md:text-base placeholder:text-gray-300"
                                />
                            </div>
                            <Link
                                href="/ilanlar"
                                className="bg-primary text-white h-12 w-12 md:w-auto md:px-8 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg"
                            >
                                <span className="hidden md:inline text-sm">ARA</span>
                                <ChevronRight size={16} />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Öne Çıkan İlanlar Section */}
            <motion.section
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="pb-12 px-6"
            >
                <div className="max-w-[1400px] mx-auto">
                    <div className="flex items-center justify-between mb-8 group">
                        <Link href="/ilanlar" className="flex items-center gap-2 hover:text-primary transition-colors">
                            <span className="text-2xl">✨</span>
                            <h2 className="text-[20px] font-black text-secondary tracking-tighter uppercase">Öne Çıkan İlanlar</h2>
                            <ChevronRight size={20} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        {/* Old arrows hidden/removed as requested */}
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="animate-spin text-primary" size={32} />
                        </div>
                    ) : filteredListings.length > 0 ? (
                        <div className="relative group/slider">
                            {/* Side Arrows */}
                            <button
                                onClick={() => scroll('left')}
                                className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-white/80 backdrop-blur-md border border-gray-100 flex items-center justify-center text-secondary shadow-xl opacity-0 group-hover/slider:opacity-100 transition-all hover:bg-primary hover:text-white hover:scale-110 md:flex hidden"
                            >
                                <ChevronLeft size={24} />
                            </button>

                            <button
                                onClick={() => scroll('right')}
                                className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-white/80 backdrop-blur-md border border-gray-100 flex items-center justify-center text-secondary shadow-xl opacity-0 group-hover/slider:opacity-100 transition-all hover:bg-primary hover:text-white hover:scale-110 md:flex hidden"
                            >
                                <ChevronRight size={24} />
                            </button>

                            <div
                                ref={scrollRef}
                                className="flex flex-nowrap overflow-x-auto no-scrollbar gap-6 pb-8 snap-x snap-mandatory"
                            >
                                <AnimatePresence mode="popLayout">
                                    {filteredListings.map((l, i) => (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.3, delay: i * 0.05 }}
                                            key={l.id}
                                            className="min-w-[300px] md:min-w-[350px] flex-shrink-0 snap-start"
                                        >
                                            <ListingCard
                                                id={l.id!}
                                                title={l.title}
                                                location={`${l.location.city} / ${l.location.district}`}
                                                price={l.price.toLocaleString("tr-TR")}
                                                rooms={l.details.roomCount}
                                                sqm={l.details.netM2}
                                                type={l.type}
                                                category={l.category}
                                                images={l.images}
                                                date={l.createdAt ? new Date(l.createdAt.seconds * 1000).toLocaleDateString("tr-TR") : undefined}
                                            />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Seçili kriterlere uygun ilan bulunamadı.</p>
                        </div>
                    )}
                </div>
            </motion.section>


            {/* Bottom SEO / Brand Bar */}
            <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="bg-secondary py-16 px-6"
            >
                <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="flex items-center gap-4">
                        <img src="/logo.png" alt="SS Gayrimenkul" className="h-12 w-auto object-contain" />
                        <div className="w-[1px] h-12 bg-white/10" />
                        <p className="text-white/40 text-[10px] uppercase font-bold tracking-[0.2em] max-w-[200px]">
                            Sakarya'nın En Köklü ve Güvenilir Gayrimenkul Yatırım Ofisi
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/ilanlar" className="px-10 py-4 border border-white/10 rounded-full text-white text-xs font-black uppercase tracking-widest hover:bg-white hover:text-secondary transition-all">
                            Portföyü İncele
                        </Link>
                        <Link href="/iletisim" className="px-10 py-4 bg-primary rounded-full text-white text-xs font-black uppercase tracking-widest hover:bg-white hover:text-secondary transition-all shadow-xl shadow-primary/20">
                            Bize Ulaşın
                        </Link>
                    </div>
                </div>
            </motion.section>
        </motion.div>
    );
}
