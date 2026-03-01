"use client";
import { useState, useEffect } from "react";
import { Search, ChevronRight, LayoutGrid, List, Loader2 } from "lucide-react";
import ListingCard from "@/components/listings/ListingCard";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { Listing } from "@/types/listing";

export default function ListingsPage() {
    const [typeFilter, setTypeFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        const q = query(collection(db, "listings"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Listing[];

            // Client-side sorting
            const sorted = [...items].sort((a, b) => {
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
    }, [typeFilter, categoryFilter]);

    const filteredListings = listings.filter(item => {
        const typeMatch = typeFilter === "all" || item.type === typeFilter.toUpperCase();
        const categoryMatch = categoryFilter === "all" || item.category === categoryFilter;
        return typeMatch && categoryMatch;
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
            <section className="pt-32 pb-12 bg-gray-50 border-b border-gray-100 px-6">
                <div className="max-w-[1400px] mx-auto">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-10">
                        <div>
                            <h1 className="text-3xl font-black text-[#333] tracking-tighter uppercase mb-2">Emlak Portföyü</h1>
                            <p className="text-gray-400 text-sm font-medium tracking-tight">Sakarya genelinde toplam <span className="text-primary font-black">{filteredListings.length}</span> ilan bulundu.</p>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            {/* Type Filter */}
                            <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                                {["all", "satilik", "kiralik"].map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setTypeFilter(f)}
                                        className={`px-6 py-2 rounded-md text-[11px] font-black uppercase tracking-widest transition-all ${typeFilter === f ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-gray-400 hover:text-gray-600"
                                            }`}
                                    >
                                        {f === "all" ? "Hepsi" : f === "satilik" ? "Satılık" : "Kiralık"}
                                    </button>
                                ))}
                            </div>

                            {/* Category Filter */}
                            <div className="flex bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                                {["all", "KONUT", "OFİS", "ARSA"].map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setCategoryFilter(cat)}
                                        className={`px-6 py-2 rounded-md text-[11px] font-black uppercase tracking-widest transition-all ${categoryFilter === cat ? "bg-secondary text-white shadow-lg shadow-secondary/20" : "text-gray-400 hover:text-gray-600"
                                            }`}
                                    >
                                        {cat === "all" ? "Hepsi" : cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Grid */}
            <section className="py-20 px-6">
                <div className="max-w-[1400px] mx-auto">
                    {loading ? (
                        <div className="flex justify-center py-40">
                            <Loader2 className="animate-spin text-primary" size={48} />
                        </div>
                    ) : paginatedListings.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {paginatedListings.map((item) => (
                                <ListingCard
                                    key={item.id}
                                    id={item.id!}
                                    title={item.title}
                                    location={`${item.location.district}, ${item.location.city}`}
                                    price={item.price.toLocaleString("tr-TR")}
                                    rooms={item.details.roomCount}
                                    sqm={item.details.netM2}
                                    type={item.type}
                                    category={item.category}
                                    images={item.images}
                                    date={item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleDateString("tr-TR") : undefined}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="py-32 text-center text-gray-400 font-bold border-2 border-dashed border-gray-100 rounded-[40px] flex flex-col items-center gap-6">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-3xl">🔍</div>
                            <div className="uppercase tracking-[0.2em] text-xs">Aradığınız kriterlere uygun ilan bulunamadı.</div>
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
                                        ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110"
                                        : "border border-gray-200 text-gray-400 hover:text-primary hover:border-primary/30 bg-white"
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
                                    className="w-10 h-10 border border-gray-200 text-gray-400 hover:text-primary hover:border-primary/30 bg-white transition-all rounded-lg flex items-center justify-center font-bold"
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
