"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Search,
    Loader2,
    CalendarClock,
    XCircle,
    CheckCircle2
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { Listing } from "@/types/listing";
import AdminGuard from "@/components/admin/AdminGuard";

export default function AdminDoping() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

    useEffect(() => {
        const q = query(collection(db, "listings"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Listing[];

            // Sort logic: active dopings first, then by created date
            const sorted = [...items].sort((a, b) => {
                const now = Date.now();
                const aFeatured = a.isFeatured && a.featuredUntil && a.featuredUntil > now;
                const bFeatured = b.isFeatured && b.featuredUntil && b.featuredUntil > now;

                if (aFeatured && !bFeatured) return -1;
                if (!aFeatured && bFeatured) return 1;

                const timeA = a.createdAt?.seconds || 0;
                const timeB = b.createdAt?.seconds || 0;
                return timeB - timeA;
            });

            setListings(sorted);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleApplyDoping = async (days: number) => {
        if (!selectedListing || !selectedListing.id) return;

        setProcessingId(selectedListing.id);
        try {
            const now = Date.now();
            const futureDate = now + (days * 24 * 60 * 60 * 1000); // milliseconds

            await updateDoc(doc(db, "listings", selectedListing.id), {
                isFeatured: true,
                featuredUntil: futureDate
            });

            alert(`${days} Günlük Doping başarıyla uygulandı.`);
            setIsModalOpen(false);
            setSelectedListing(null);
        } catch (error) {
            console.error("Doping error:", error);
            alert("Doping uygulanırken bir hata oluştu.");
        } finally {
            setProcessingId(null);
        }
    };

    const handleRemoveDoping = async (listingId: string) => {
        if (!confirm("Bu ilanın dopingini (öne çıkarılmasını) iptal etmek istediğinize emin misiniz?")) return;

        setProcessingId(listingId);
        try {
            await updateDoc(doc(db, "listings", listingId), {
                isFeatured: false,
                featuredUntil: null
            });
            alert("Doping başarıyla kaldırıldı.");
        } catch (error) {
            console.error("Doping remove error:", error);
            alert("Doping kaldırılırken bir hata oluştu.");
        } finally {
            setProcessingId(null);
        }
    };

    const isListingDoped = (l: Listing) => {
        return l.isFeatured && l.featuredUntil && l.featuredUntil > Date.now();
    };

    const filteredListings = listings.filter(l =>
        l.status !== "pending" && (
            l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            l.details?.listingId?.includes(searchTerm)
        )
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-[#E10600]" size={40} />
                    <p className="text-xs font-black uppercase tracking-widest text-neutral-400">İlanlar Yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <AdminGuard>
            <div className="min-h-screen bg-neutral-100 p-8 lg:p-12 text-black">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <Link href="/admin/dashboard" className="p-3 bg-white rounded-2xl hover:bg-[#E10600] hover:text-white transition-all shadow-sm group">
                            <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter uppercase text-black">Doping Yönetimi</h1>
                            <p className="text-neutral-400 font-medium tracking-tight">İlanları öne çıkarın ve sürelerini yönetin</p>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="mb-8 bg-white border border-neutral-400/30 rounded-2xl flex items-center gap-4 px-6 py-4 shadow-sm">
                        <Search className="text-[#E10600]/60" size={20} />
                        <input
                            type="text"
                            placeholder="İlan başlığı veya ID ile ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-none outline-none text-black w-full placeholder:text-neutral-400 font-bold"
                        />
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-3xl border border-neutral-400/30 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-neutral-400/30 bg-neutral-100/50">
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">İlan</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 text-center">Fiyat / Tür</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 text-center">Doping Durumu</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 text-right">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#A0A0A0]/20 font-medium">
                                    {filteredListings.map((listing) => {
                                        const doped = isListingDoped(listing);
                                        const formatDate = (ts?: number) => {
                                            if (!ts) return "-";
                                            return new Date(ts).toLocaleDateString("tr-TR", { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                                        };

                                        return (
                                            <tr key={listing.id} className={`transition-colors group ${doped ? "bg-[#E10600]/5" : "hover:bg-neutral-100/50"}`}>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-16 h-16 bg-neutral-100 rounded-xl shrink-0 overflow-hidden border border-neutral-400/30">
                                                            {listing.images && listing.images[0] ? (
                                                                <img src={listing.images[0]} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full bg-[#E10600]/5 flex items-center justify-center" />
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-black font-black line-clamp-1">{listing.title}</span>
                                                            <span className="text-[10px] text-neutral-400 uppercase tracking-widest mt-1 font-bold">
                                                                İlan No: {listing.details?.listingId || "-"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-[#E10600] font-black whitespace-nowrap">
                                                            ₺{listing.price.toLocaleString("tr-TR")}
                                                        </span>
                                                        <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded-full mt-1 font-bold tracking-widest uppercase">
                                                            {listing.type}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    {doped ? (
                                                        <div className="flex flex-col items-center gap-1">
                                                            <span className="flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                                                                <CheckCircle2 size={14} /> Aktif Doping
                                                            </span>
                                                            <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest">
                                                                Bitiş: {formatDate(listing.featuredUntil)}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-neutral-400 text-[10px] font-black uppercase tracking-widest">
                                                            Yok
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center justify-end gap-3">
                                                        {doped ? (
                                                            <button
                                                                onClick={() => handleRemoveDoping(listing.id!)}
                                                                disabled={processingId === listing.id}
                                                                className="p-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm"
                                                                title="Dopingi İptal Et"
                                                            >
                                                                {processingId === listing.id ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => { setSelectedListing(listing); setIsModalOpen(true); }}
                                                                className="flex items-center gap-2 px-4 py-2 border-2 border-[#E10600] text-[#E10600] hover:bg-[#E10600] hover:text-white rounded-xl font-bold transition-all text-[11px] uppercase tracking-widest"
                                                            >
                                                                <CalendarClock size={16} />
                                                                Doping Ekle
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {filteredListings.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-12 text-center text-neutral-400 font-bold tracking-widest uppercase text-xs">
                                                İlan bulunamadı.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Doping Modal */}
            {isModalOpen && selectedListing && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white p-8 rounded-3xl max-w-md w-full shadow-2xl">
                        <h3 className="text-xl font-black text-black uppercase tracking-tight mb-2">Doping Süresi Seçin</h3>
                        <p className="text-sm font-medium text-neutral-400 mb-6 line-clamp-2">
                            {selectedListing.title} ilanı için ana sayfa ve portföyde öne çıkma süresini belirleyin.
                        </p>

                        <div className="space-y-3">
                            {[7, 15, 30].map(days => (
                                <button
                                    key={days}
                                    onClick={() => handleApplyDoping(days)}
                                    disabled={processingId === selectedListing.id}
                                    className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-neutral-400/30 hover:border-[#E10600] transition-colors group"
                                >
                                    <span className="font-black text-black text-lg">{days} Gün</span>
                                    {processingId === selectedListing.id ? (
                                        <Loader2 className="animate-spin text-[#E10600]" size={20} />
                                    ) : (
                                        <span className="text-xs font-bold text-[#E10600] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Seç</span>
                                    )}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => { setIsModalOpen(false); setSelectedListing(null); }}
                            className="mt-6 w-full py-3 text-neutral-400 hover:text-black font-bold uppercase tracking-widest text-xs transition-colors"
                        >
                            İptal Et
                        </button>
                    </div>
                </div>
            )}
        </AdminGuard>
    );
}
