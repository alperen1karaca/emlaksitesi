"use client";
import { useState, useEffect, Suspense } from "react";
import { Search, ChevronRight, LayoutGrid, List, Loader2, ChevronLeft } from "lucide-react";
import ListingCard from "@/components/listings/ListingCard";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { Listing } from "@/types/listing";
import { CITY_LOCATIONS, CITIES } from "@/constants/locations";
import { useSearchParams } from "next/navigation";

function ListingsContent() {
    const searchParams = useSearchParams();
    const cityParam = searchParams.get("city");
    const districtParam = searchParams.get("district");
    const neighborhoodParam = searchParams.get("neighborhood");
    const typeParam = searchParams.get("type");
    const categoryParam = searchParams.get("category");

    const [typeFilter, setTypeFilter] = useState(typeParam || "all");
    const [categoryFilter, setCategoryFilter] = useState(categoryParam || "all");
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCity, setSelectedCity] = useState(cityParam || "all");
    const [selectedDistrict, setSelectedDistrict] = useState(districtParam || "all");
    const [selectedNeighborhood, setSelectedNeighborhood] = useState(neighborhoodParam || "all");
    const [searchQuery, setSearchQuery] = useState("");
    const itemsPerPage = 8;

    // Sync with URL params if they change
    useEffect(() => {
        if (cityParam) setSelectedCity(cityParam);
        if (districtParam) setSelectedDistrict(districtParam);
        if (neighborhoodParam) setSelectedNeighborhood(neighborhoodParam);
        if (typeParam) setTypeFilter(typeParam);
        if (categoryParam) setCategoryFilter(categoryParam);
    }, [cityParam, districtParam, neighborhoodParam, typeParam, categoryParam]);

    useEffect(() => {
        const q = query(collection(db, "listings"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Listing[];

            // Client-side sorting
            const sorted = [...items].sort((a, b) => {
                const now = Date.now();
                const aFeatured = a.isFeatured && a.featuredUntil && a.featuredUntil > now;
                const bFeatured = b.isFeatured && b.featuredUntil && b.featuredUntil > now;

                // Featured items at the top
                if (aFeatured && !bFeatured) return -1;
                if (!aFeatured && bFeatured) return 1;

                // If both are featured, randomize them
                if (aFeatured && bFeatured) {
                    return Math.random() - 0.5;
                }

                // If neither are featured, sort by date (newest first)
                const timeA = a.createdAt?.seconds || 0;
                const timeB = b.createdAt?.seconds || 0;
                return timeB - timeA;
            });

            setListings(sorted);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Handle filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [typeFilter, categoryFilter, selectedCity, selectedDistrict, selectedNeighborhood, searchQuery]);

    const filteredListings = listings.filter(item => {
        const typeMatch = typeFilter === "all" || item.type === typeFilter.toUpperCase();
        const categoryMatch = categoryFilter === "all" || item.category === categoryFilter;
        const cityMatch = selectedCity === "all" || item.location.city === selectedCity;
        const districtMatch = selectedDistrict === "all" || item.location.district === selectedDistrict;
        const neighborhoodMatch = selectedNeighborhood === "all" || item.location.neighborhood === selectedNeighborhood;
        const searchMatch = !searchQuery ||
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.location.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.location.neighborhood.toLowerCase().includes(searchQuery.toLowerCase());

        // Only show approved listings (or legacy entries without status)
        const statusMatch = item.status === "approved" || !item.status;

        return typeMatch && categoryMatch && cityMatch && districtMatch && neighborhoodMatch && searchMatch && statusMatch;
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
    const paginatedListings = filteredListings.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="min-h-screen bg-white pb-24">
            {/* Header / Filter Section */}
            <section className="pt-24 pb-8 bg-neutral-100 border-b border-neutral-400/30 px-6">
                <div className="max-w-[1400px] mx-auto">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-10">
                        <div>
                            <h1 className="text-3xl font-heading font-black text-black tracking-tighter uppercase mb-2">Emlak Portföyü</h1>
                            <p className="text-neutral-400 text-sm font-medium tracking-tight">Toplam <span className="text-[#E10600] font-heading font-black">{filteredListings.length}</span> ilan bulundu.</p>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            {/* Type Filter */}
                            <div className="flex bg-white p-1 rounded-lg border border-neutral-400/30 shadow-sm">
                                {["all", "satilik", "kiralik"].map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setTypeFilter(f)}
                                        className={`px-6 py-2 rounded-md text-[11px] font-heading font-black uppercase tracking-widest transition-all ${typeFilter === f ? "bg-[#E10600] text-white shadow-md shadow-[#E10600]/30" : "text-neutral-400 hover:text-neutral-800"
                                            }`}
                                    >
                                        {f === "all" ? "Hepsi" : f === "satilik" ? "Satılık" : "Kiralık"}
                                    </button>
                                ))}
                            </div>

                            {/* Category Filter */}
                            <div className="flex bg-white p-1 rounded-lg border border-neutral-400/30 shadow-sm">
                                {["all", "KONUT", "OFİS", "ARSA"].map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setCategoryFilter(cat)}
                                        className={`px-6 py-2 rounded-md text-[11px] font-heading font-black uppercase tracking-widest transition-all ${categoryFilter === cat ? "bg-black text-white shadow-md shadow-black/30" : "text-neutral-400 hover:text-neutral-800"
                                            }`}
                                    >
                                        {cat === "all" ? "Hepsi" : cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex bg-white p-1 rounded-lg border border-neutral-400/30 shadow-sm gap-2 px-4 items-center min-w-[160px]">
                            <span className="text-[10px] font-heading font-black text-neutral-400 uppercase tracking-widest">Şehir:</span>
                            <select
                                value={selectedCity}
                                onChange={(e) => {
                                    setSelectedCity(e.target.value);
                                    setSelectedDistrict("all");
                                    setSelectedNeighborhood("all");
                                }}
                                className="bg-transparent border-none outline-none text-black font-bold text-xs cursor-pointer py-2 w-full appearance-none"
                            >
                                <option value="all">Hepsi</option>
                                {CITIES.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex bg-white p-1 rounded-lg border border-neutral-400/30 shadow-sm gap-2 px-4 items-center min-w-[160px]">
                            <span className="text-[10px] font-heading font-black text-neutral-400 uppercase tracking-widest">İlçe:</span>
                            <select
                                value={selectedDistrict}
                                onChange={(e) => {
                                    setSelectedDistrict(e.target.value);
                                    setSelectedNeighborhood("all");
                                }}
                                disabled={selectedCity === "all"}
                                className="bg-transparent border-none outline-none text-black font-bold text-xs cursor-pointer py-2 w-full appearance-none disabled:opacity-50"
                            >
                                <option value="all">Hepsi</option>
                                {selectedCity !== "all" && CITY_LOCATIONS[selectedCity] && Object.keys(CITY_LOCATIONS[selectedCity]).sort().map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex bg-white p-1 rounded-lg border border-neutral-400/30 shadow-sm gap-2 px-4 items-center min-w-[160px]">
                            <span className="text-[10px] font-heading font-black text-neutral-400 uppercase tracking-widest">Mahalle:</span>
                            <select
                                value={selectedNeighborhood}
                                onChange={(e) => setSelectedNeighborhood(e.target.value)}
                                disabled={selectedDistrict === "all"}
                                className="bg-transparent border-none outline-none text-black font-bold text-xs cursor-pointer py-2 w-full appearance-none disabled:opacity-50"
                            >
                                <option value="all">Hepsi</option>
                                {selectedDistrict !== "all" && CITY_LOCATIONS[selectedCity]?.[selectedDistrict]?.sort().map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>

                        {/* Search Bar */}
                        <div className="flex-1 flex items-center bg-white border border-neutral-400/30 rounded-lg px-4 gap-3 shadow-sm focus-within:border-[#E10600] transition-all">
                            <Search size={18} className="text-neutral-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="İlan başlığı veya konum ara..."
                                className="w-full py-3 bg-transparent border-none outline-none text-black font-bold text-sm placeholder:text-neutral-400"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Grid */}
            <section className="py-12 px-6">
                <div className="max-w-[1400px] mx-auto">
                    {loading ? (
                        <div className="flex justify-center py-40">
                            <Loader2 className="animate-spin text-[#E10600]" size={48} />
                        </div>
                    ) : paginatedListings.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {paginatedListings.map((item) => (
                                <ListingCard
                                    key={item.id}
                                    id={item.id!}
                                    listingNumber={item.details?.listingId}
                                    title={item.title}
                                    city={item.location.city}
                                    district={item.location.district}
                                    neighborhood={item.location.neighborhood}
                                    location={`${item.location.district}, ${item.location.city}`}
                                    price={item.price.toLocaleString("tr-TR")}
                                    rooms={item.details.roomCount}
                                    sqm={item.details.netM2}
                                    type={item.type}
                                    category={item.category}
                                    images={item.images}
                                    date={item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleDateString("tr-TR") : undefined}
                                    agentId={item.agentId}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center text-neutral-400 font-bold border-2 border-dashed border-neutral-400/30 rounded-[40px] flex flex-col items-center gap-6">
                            <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center text-3xl">🔍</div>
                            <div className="uppercase tracking-[0.2em] text-xs text-neutral-800">Aradığınız kriterlere uygun ilan bulunamadı.</div>
                        </div>
                    )}

                    {/* Pagination */}
                    {!loading && totalPages > 1 && (
                        <div className="mt-20 flex justify-center items-center gap-3">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => {
                                        setCurrentPage(page);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-all ${currentPage === page
                                        ? "bg-[#E10600] text-white shadow-md shadow-[#E10600]/30 scale-110"
                                        : "border border-neutral-400/30 text-neutral-400 hover:text-[#E10600] hover:border-[#E10600]/50 bg-white"
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                            {currentPage < totalPages && (
                                <button
                                    onClick={() => {
                                        setCurrentPage(prev => prev + 1);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="w-10 h-10 border border-neutral-400/30 text-neutral-400 hover:text-[#E10600] hover:border-[#E10600]/50 bg-white transition-all rounded-lg flex items-center justify-center font-bold"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

export default function ListingsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="animate-spin text-[#E10600]" size={48} />
            </div>
        }>
            <ListingsContent />
        </Suspense>
    );
}
