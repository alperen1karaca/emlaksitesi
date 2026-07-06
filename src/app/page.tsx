"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Search, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import ListingCard from "@/components/listings/ListingCard";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { Listing } from "@/types/listing";
import { motion } from "framer-motion";
import HeroSlider from "@/components/home/HeroSlider";
import { HeroSlide } from "@/types/listing";
import { CITY_LOCATIONS, CITIES } from "@/constants/locations";
import ServicesSection from "@/components/layout/ServicesSection";
import PromotionalBanner from "@/components/layout/PromotionalBanner";
import { HeroScene, ProjectsScene } from "@/components/common/LineAnimations";

export default function Home() {
    const [activeTab, setActiveTab] = useState("hepsi");
    const [activeCategory, setActiveCategory] = useState("HEPSİ");
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [slides, setSlides] = useState<HeroSlide[]>([]);
    const [selectedCity, setSelectedCity] = useState("Sakarya");
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [selectedNeighborhood, setSelectedNeighborhood] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Try to load from session storage first for instant hydration
        const cachedSlides = sessionStorage.getItem("cached_hero_slides");
        if (cachedSlides) {
            try {
                setSlides(JSON.parse(cachedSlides));
            } catch (e) {
                console.warn("Failed to parse cached slides:", e);
            }
        }

        const fetchSlides = async () => {
            try {
                const q = query(collection(db, "hero_slides"), orderBy("order", "asc"));
                const querySnapshot = await getDocs(q);
                const slidesData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as HeroSlide[];
                setSlides(slidesData);
                // Update cache
                sessionStorage.setItem("cached_hero_slides", JSON.stringify(slidesData));
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
        const matchesCity = !selectedCity || l.location.city === selectedCity;
        const matchesDistrict = !selectedDistrict || l.location.district === selectedDistrict;
        const matchesNeighborhood = !selectedNeighborhood || l.location.neighborhood === selectedNeighborhood;
        const matchesSearch = !searchQuery ||
            l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            l.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
            l.location.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
            l.location.neighborhood.toLowerCase().includes(searchQuery.toLowerCase());

        // Only show approved listings
        const statusMatch = l.status === "approved" || !l.status;

        return matchesTab && matchesCategory && matchesCity && matchesDistrict && matchesNeighborhood && matchesSearch && statusMatch;
    }).sort((a, b) => {
        const now = Date.now();
        const aFeatured = a.isFeatured && a.featuredUntil && a.featuredUntil > now;
        const bFeatured = b.isFeatured && b.featuredUntil && b.featuredUntil > now;

        if (aFeatured && !bFeatured) return -1;
        if (!aFeatured && bFeatured) return 1;
        if (aFeatured && bFeatured) return Math.random() - 0.5;
        return 0;
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
        KONUT: listings.filter(l => l.category === "KONUT" && (l.status === "approved" || !l.status)).length,
        OFİS: listings.filter(l => l.category === "OFİS" && (l.status === "approved" || !l.status)).length,
        ARSA: listings.filter(l => l.category === "ARSA" && (l.status === "approved" || !l.status)).length,
        TOTAL: listings.filter(l => l.status === "approved" || !l.status).length
    };    return (
        <div className="bg-white text-neutral-800 selection:bg-[#E10600]/20">
            {/* Premium Minimalist Hero Section */}
            <motion.section 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="relative w-full h-[450px] md:h-[580px] overflow-hidden bg-white"
            >
                <HeroSlider slides={slides} />
                <HeroScene />
            </motion.section>

            {/* Premium Minimalist Search Bar - Moved Below Hero */}
            <div className="relative z-40 -mt-10 md:-mt-14 px-4 md:px-6 flex justify-center">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="max-w-5xl w-full"
                >
                    {/* Minimalist Search & Filters - Transparent Container */}
                    <div className="w-full space-y-4 md:space-y-6">

                        {/* Dual Filters */}
                        <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3">
                            <div className="flex bg-black/10 backdrop-blur-md p-0.5 md:p-1 rounded-full border border-black/10 scale-[0.85] md:scale-95 shadow-sm">
                                {["hepsi", "satilik", "kiralik"].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-3 md:px-8 py-1 md:py-2 rounded-full text-[7px] md:text-[9px] font-black uppercase tracking-widest transition-all duration-500 ${activeTab === tab
                                            ? "bg-[#E10600] text-white shadow-lg"
                                            : "text-neutral-600 hover:text-black"
                                            }`}
                                    >
                                        {tab === "hepsi" ? "HEPSİ" : tab === "satilik" ? "SATILIK" : "KİRALIK"}
                                    </button>
                                ))}
                            </div>
                            <div className="flex bg-black/10 backdrop-blur-md p-0.5 md:p-1 rounded-full border border-black/10 scale-[0.85] md:scale-95 shadow-sm">
                                {["HEPSİ", "KONUT", "OFİS", "ARSA"].map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setActiveCategory(cat)}
                                        className={`px-3 md:px-8 py-1 md:py-2 rounded-full text-[7px] md:text-[9px] font-black uppercase tracking-widest transition-all duration-500 ${activeCategory === cat
                                            ? "bg-white text-black shadow-lg"
                                            : "text-neutral-600 hover:text-black"
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Main Search Panel */}
                        <div className="bg-white rounded-2xl md:rounded-full p-1 md:p-2 shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col md:flex-row items-stretch gap-1">
                            <div className="grid grid-cols-2 md:flex flex-1">
                                {/* Location Selectors */}
                                <div className="px-3 md:px-6 py-1.5 md:py-0 border-r border-neutral-100 flex flex-col justify-center">
                                    <span className="text-[5px] md:text-[7px] font-black text-neutral-500 uppercase tracking-widest block mb-0.5">ŞEHİR</span>
                                    <select
                                        value={selectedCity}
                                        onChange={(e) => {
                                            setSelectedCity(e.target.value);
                                            setSelectedDistrict("");
                                            setSelectedNeighborhood("");
                                        }}
                                        className="bg-transparent text-black font-black text-[8px] md:text-xs outline-none appearance-none cursor-pointer"
                                    >
                                        <option value="">Tümü</option>
                                        {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="px-3 md:px-6 py-1.5 md:py-0 border-r md:border-r border-neutral-100 flex flex-col justify-center">
                                    <span className="text-[5px] md:text-[7px] font-black text-neutral-500 uppercase tracking-widest block mb-0.5">İLÇE</span>
                                    <select
                                        value={selectedDistrict}
                                        onChange={(e) => {
                                            setSelectedDistrict(e.target.value);
                                            setSelectedNeighborhood("");
                                        }}
                                        disabled={!selectedCity}
                                        className="bg-transparent text-black font-black text-[8px] md:text-xs outline-none appearance-none cursor-pointer disabled:opacity-30"
                                    >
                                        <option value="">Tümü</option>
                                        {selectedCity && CITY_LOCATIONS[selectedCity] && Object.keys(CITY_LOCATIONS[selectedCity]).sort().map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            {/* Text Search */}
                            <div className="px-4 md:px-6 py-2 md:py-0 flex items-center gap-2 border-t md:border-t-0 border-neutral-100">
                                <Search size={10} className="text-[#E10600]" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="İlan ara..."
                                    className="w-full bg-transparent text-black font-black text-[9px] md:text-xs outline-none placeholder:text-neutral-400"
                                />
                            </div>

                            {/* Search Action */}
                            <Link
                                href="/ilanlar"
                                className="bg-[#E10600] text-white px-5 md:px-8 py-2 md:py-3.5 rounded-xl md:rounded-full font-black text-[9px] md:text-xs tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_30px_rgba(225,6,0,0.2)]"
                            >
                                <span>KEŞFET</span>
                                <ChevronRight size={12} />
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Öne Çıkan İlanlar Section */}
            <motion.section 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="pt-16 pb-16 px-6 relative overflow-hidden bg-white"
            >
                <ProjectsScene />
                <div className="max-w-[1400px] mx-auto relative z-10">
                    <div className="flex items-center justify-between mb-8 group">
                        <Link href="/ilanlar" className="flex items-center gap-2 hover:text-[#E10600] transition-colors">
                            <span className="text-2xl">✨</span>
                            <h2 className="text-[20px] font-heading font-bold text-black tracking-tighter uppercase">Öne Çıkan İlanlar</h2>
                            <ChevronRight size={20} className="text-neutral-400 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="animate-spin text-[#E10600]" size={32} />
                        </div>
                    ) : filteredListings.length > 0 ? (
                        <div className="relative group/slider">
                            {/* Side Arrows */}
                            <button
                                onClick={() => scroll('left')}
                                className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-white/80 backdrop-blur-md border border-neutral-100 flex items-center justify-center text-black shadow-xl opacity-0 group-hover/slider:opacity-100 transition-all hover:bg-[#E10600] hover:text-white hover:scale-110 md:flex hidden"
                            >
                                <ChevronLeft size={24} />
                            </button>

                            <button
                                onClick={() => scroll('right')}
                                className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-white/80 backdrop-blur-md border border-neutral-100 flex items-center justify-center text-black shadow-xl opacity-0 group-hover/slider:opacity-100 transition-all hover:bg-[#E10600] hover:text-white hover:scale-110 md:flex hidden"
                            >
                                <ChevronRight size={24} />
                            </button>

                            <div
                                ref={scrollRef}
                                className="grid grid-cols-2 md:flex md:flex-nowrap overflow-x-hidden md:overflow-x-auto no-scrollbar gap-3 md:gap-6 pb-8 snap-x snap-mandatory px-0 md:px-0"
                            >
                                {filteredListings.map((l) => (
                                    <div
                                        key={l.id}
                                        className="w-full md:w-[350px] flex-shrink-0 snap-start"
                                    >
                                        <ListingCard
                                            id={l.id!}
                                            listingNumber={l.details?.listingId}
                                            title={l.title}
                                            city={l.location.city}
                                            district={l.location.district}
                                            neighborhood={l.location.neighborhood}
                                            location={`${l.location.city} / ${l.location.district}`}
                                            price={l.price.toLocaleString("tr-TR")}
                                            rooms={l.details.roomCount}
                                            sqm={l.details.netM2}
                                            type={l.type}
                                            category={l.category}
                                            images={l.images}
                                            date={l.createdAt ? new Date(l.createdAt.seconds * 1000).toLocaleDateString("tr-TR") : undefined}
                                            agentId={l.agentId}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-neutral-100 rounded-3xl border border-dashed border-neutral-400">
                            <p className="text-neutral-400 font-bold uppercase tracking-widest text-sm">Seçili kriterlere uygun ilan bulunamadı.</p>
                        </div>
                    )}
                </div>
            </motion.section>

            {/* Services Section */}
            <div className="bg-white">
                <ServicesSection />
            </div>

            {/* Promotional Banner */}
            <PromotionalBanner />

            <div className="relative py-12 overflow-hidden bg-white">
                <ProjectsScene />
                {/* Bottom SEO / Brand Bar */}
                <section className="bg-neutral-100 py-10 px-6 border-y border-neutral-400/20 relative z-10">
                <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="flex items-center gap-4">
                        <img src="/logo.png" alt="SS Gayrimenkul" className="h-12 w-auto object-contain" />
                        <div className="w-[1px] h-12 bg-black/10" />
                        <p className="text-neutral-800 text-[10px] uppercase font-bold tracking-[0.2em] max-w-[200px]">
                            Sakarya'nın En Köklü ve Güvenilir Gayrimenkul Yatırım Ofisi
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/ilanlar" className="px-10 py-4 border border-black/10 rounded-full text-black text-xs font-heading font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                            Portföyü İncele
                        </Link>
                        <Link href="/iletisim" className="px-10 py-4 bg-[#E10600] rounded-full text-white text-xs font-heading font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-md">
                            Bize Ulaşın
                        </Link>
                    </div>
                </div>
            </section>
        </div>
        </div>
    );
}
