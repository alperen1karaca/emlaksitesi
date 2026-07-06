"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Plus,
    Search,
    Trash2,
    Pencil,
    ExternalLink,
    LayoutDashboard,
    Image as ImageIcon,
    Users,
    ShieldCheck,
    ChevronRight,
    Loader2,
    MessageSquare
} from "lucide-react";
import { db, auth } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Listing } from "@/types/listing";
import AdminGuard from "@/components/admin/AdminGuard";

export default function AdminDashboard() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const q = query(collection(db, "listings"));
        const unsubscribeListings = onSnapshot(q,
            (snapshot) => {
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
                setError(null);
            },
            (err) => {
                console.error("Firestore error:", err);
                setError("Veriler yüklenirken bir hata oluştu. Firestore kurallarını veya indeksleri kontrol edin.");
                setLoading(false);
            }
        );

        return () => {
            if (unsubscribeListings) unsubscribeListings();
        };
    }, []);

    const handleDelete = async (id: string, imageUrls?: string[]) => {
        console.log("Delete attempt for ID:", id);
        if (!id) {
            alert("Hata: İlan ID'si bulunamadı.");
            return;
        }
        try {
            if (imageUrls && imageUrls.length > 0) {
                try {
                    console.log("Deleting images from R2...");
                    await fetch("/api/delete", {
                        method: "POST",
                        body: JSON.stringify({ urls: imageUrls }),
                    });
                } catch (r2Error) {
                    console.error("R2 silme hatası (göz ardı ediliyor):", r2Error);
                }
            }
            console.log("Deleting document from Firestore...");
            await deleteDoc(doc(db, "listings", id));
            console.log("Delete successful");
            alert("İlan başarıyla silindi.");
            setDeletingId(null);
        } catch (error: any) {
            console.error("Silme hatası detayı:", error);
            alert(`İlan silinirken bir hata oluştu: ${error.message || "Bilinmeyen hata"}`);
            setDeletingId(null);
        }
    };

    const filteredListings = listings.filter(l =>
        l.status !== "pending" && (
            l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            l.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            l.details?.listingId?.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-[#E10600]" size={40} />
                    <p className="text-xs font-black uppercase tracking-widest text-neutral-400">Veriler Yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white p-6">
                <div className="max-w-md w-full text-center space-y-4">
                    <div className="text-[#E10600] bg-[#E10600]/10 p-6 rounded-3xl border border-[#E10600]/20 font-bold">
                        {error}
                    </div>
                    <button onClick={() => window.location.reload()} className="premium-button w-full py-4 text-sm uppercase tracking-widest font-black">
                        Tekrar Dene
                    </button>
                </div>
            </div>
        );
    }

    return (
        <AdminGuard>
            <div className="min-h-screen bg-neutral-100 p-4 md:p-8 lg:p-12 text-black">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                        <div>
                            <h1 className="text-2xl md:text-4xl font-black tracking-tighter mb-2 uppercase text-black">Yönetim Paneli</h1>
                            <p className="text-neutral-400 font-medium tracking-tight text-sm">Toplam <span className="text-[#E10600] font-black">{listings.length}</span> İlan Portföyde</p>
                        </div>
                        <div className="flex flex-wrap gap-2 md:gap-4">
                            <Link href="/admin/add" className="premium-button flex items-center gap-2 md:gap-3 px-4 md:px-8 py-2.5 md:py-4 text-xs md:text-sm shadow-xl shadow-[#E10600]/20 transition-all hover:scale-[1.02]">
                                <Plus size={16} />
                                Yeni İlan
                            </Link>
                            <Link href="/admin/hero" className="flex items-center gap-2 md:gap-3 px-4 md:px-8 py-2.5 md:py-4 bg-black text-white rounded-full font-bold text-xs md:text-sm shadow-xl shadow-black/10 hover:scale-[1.02] transition-all">
                                <LayoutDashboard size={16} />
                                Slayt
                            </Link>
                            <Link href="/admin/agents" className="flex items-center gap-2 md:gap-3 px-4 md:px-8 py-2.5 md:py-4 bg-[#E10600] text-white rounded-full font-bold text-xs md:text-sm shadow-xl shadow-[#E10600]/20 hover:scale-[1.02] transition-all">
                                <Users size={16} />
                                Danışmanlar
                            </Link>
                            <Link href="/admin/users" className="flex items-center gap-2 md:gap-3 px-4 md:px-8 py-2.5 md:py-4 bg-black text-white rounded-full font-bold text-xs md:text-sm shadow-xl shadow-black/10 hover:scale-[1.02] transition-all">
                                <ShieldCheck size={16} />
                                Kullanıcılar
                            </Link>
                            <Link href="/admin/basvurular" className="flex items-center gap-2 md:gap-3 px-4 md:px-8 py-2.5 md:py-4 bg-[#E10600] text-white rounded-full font-bold text-xs md:text-sm shadow-xl shadow-[#E10600]/20 hover:scale-[1.02] transition-all">
                                <Pencil size={16} />
                                Başvurular
                            </Link>
                            <Link href="/admin/destek" className="flex items-center gap-2 md:gap-3 px-4 md:px-8 py-2.5 md:py-4 bg-white border border-neutral-400/20 text-black rounded-full font-bold text-xs md:text-sm shadow-xl shadow-black/5 hover:scale-[1.02] transition-all">
                                <MessageSquare size={16} className="text-[#E10600]" />
                                Destek
                            </Link>
                            <Link href="/admin/doping" className="flex items-center gap-2 md:gap-3 px-4 md:px-8 py-2.5 md:py-4 bg-black text-white rounded-full font-bold text-xs md:text-sm shadow-xl shadow-black/10 hover:scale-[1.02] transition-all">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                Doping
                            </Link>
                        </div>
                    </div>

                    <div className="mb-8 flex flex-col md:flex-row gap-4">
                        <div className="flex-1 bg-white border border-neutral-400/30 rounded-2xl flex items-center gap-4 px-6 py-4 shadow-sm">
                            <Search className="text-[#E10600]/60" size={20} />
                            <input
                                type="text"
                                placeholder="İlan başlığı veya ID ile ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-transparent border-none outline-none text-black w-full placeholder:text-neutral-400 font-bold"
                            />
                        </div>
                    </div>

                    {/* Mobile Card Layout */}
                    <div className="flex flex-col gap-3 md:hidden">
                        {filteredListings.map((listing) => (
                            <div key={listing.id} className="bg-white rounded-2xl border border-neutral-400/30 shadow-sm p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-14 h-14 bg-neutral-100 rounded-xl shrink-0 overflow-hidden border border-neutral-400/30">
                                        {listing.images && listing.images[0] ? (
                                            <img src={listing.images[0]} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-[#E10600]/5 flex items-center justify-center">
                                                <Plus size={16} className="text-[#E10600]/20" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-black font-black text-sm truncate">{listing.title}</span>
                                            <span className="text-[#E10600] font-bold text-[10px] shrink-0">{listing.details?.listingId}</span>
                                        </div>
                                        <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">{listing.details?.propertyType}</span>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase shrink-0 ${listing.type === "SATILIK" ? "bg-[#E10600]/10 text-[#E10600]" : "bg-black/10 text-black"}`}>
                                        {listing.type}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center mb-3 text-sm">
                                    <span className="text-black font-black">{listing.price.toLocaleString("tr-TR")} TL</span>
                                    <span className="text-neutral-400 text-[10px] font-bold uppercase">
                                        {listing.createdAt?.toDate ? listing.createdAt.toDate().toLocaleDateString("tr-TR") : "..."}
                                    </span>
                                </div>

                                <div className="border-t border-neutral-100 pt-3">
                                    {deletingId === listing.id ? (
                                        <div className="flex items-center gap-2 justify-center">
                                            <span className="text-[10px] font-black text-[#E10600] uppercase">Emin misiniz?</span>
                                            <button
                                                onClick={() => handleDelete(listing.id!, listing.images)}
                                                className="bg-[#E10600] text-white text-[10px] px-4 py-2 rounded-xl uppercase font-bold"
                                            >
                                                Evet, Sil
                                            </button>
                                            <button
                                                onClick={() => setDeletingId(null)}
                                                className="bg-white text-neutral-400 text-[10px] px-4 py-2 rounded-xl uppercase font-bold border border-neutral-400/30"
                                            >
                                                İptal
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2 justify-center">
                                            <button
                                                onClick={() => router.push(`/admin/edit/${listing.id}`)}
                                                className="flex-1 h-9 bg-white border border-neutral-400/30 rounded-xl flex items-center justify-center gap-1.5 text-neutral-400 hover:text-[#E10600] text-[10px] font-bold uppercase transition-all"
                                            >
                                                <Pencil size={13} /> Düzenle
                                            </button>
                                            <button
                                                onClick={() => setDeletingId(listing.id!)}
                                                className="h-9 w-9 bg-white border border-neutral-400/30 rounded-xl flex items-center justify-center text-neutral-400 hover:text-[#E10600] transition-all"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                            <Link
                                                href={`/ilanlar/${listing.details?.listingId || listing.id}`}
                                                target="_blank"
                                                className="h-9 w-9 bg-white border border-neutral-400/30 rounded-xl flex items-center justify-center text-neutral-400 hover:text-black transition-all"
                                            >
                                                <ExternalLink size={13} />
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Table Layout */}
                    <div className="hidden md:block bg-white rounded-3xl border border-neutral-400/30 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-neutral-400/30 bg-neutral-100/50">
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">İlan No</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Görsel & Başlık</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 text-center">Tür</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 text-right">Fiyat</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 text-right">Tarih</th>
                                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 text-center">İşlemler</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#A0A0A0]/20 font-medium">
                                    {filteredListings.map((listing) => (
                                        <tr key={listing.id} className="hover:bg-neutral-100/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <span className="text-[#E10600] font-black text-xs tracking-tighter">{listing.details?.listingId || "-"}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-16 h-16 bg-neutral-100 rounded-xl shrink-0 overflow-hidden border border-neutral-400/30">
                                                        {listing.images && listing.images[0] ? (
                                                            <img src={listing.images[0]} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full bg-[#E10600]/5 flex items-center justify-center">
                                                                <Plus size={20} className="text-[#E10600]/20" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-black font-black group-hover:text-[#E10600] transition-colors line-clamp-1">{listing.title}</span>
                                                        <span className="text-[10px] text-neutral-400 uppercase tracking-widest mt-1 font-bold">{listing.details?.propertyType}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${listing.type === "SATILIK" ? "bg-[#E10600]/10 text-[#E10600]" : "bg-black/10 text-black"}`}>
                                                    {listing.type}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right font-black text-black">
                                                {listing.price.toLocaleString("tr-TR")} TL
                                            </td>
                                            <td className="px-8 py-6 text-right text-neutral-400 text-xs font-bold uppercase italic">
                                                {listing.createdAt?.toDate ? listing.createdAt.toDate().toLocaleDateString("tr-TR") : "..."}
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex justify-center items-center gap-3 transition-opacity">
                                                    {deletingId === listing.id ? (
                                                        <div className="flex items-center gap-2 bg-[#E10600]/10 p-1.5 rounded-xl border border-[#E10600]/20">
                                                            <span className="text-[10px] font-bold text-[#E10600] px-2 uppercase tracking-tighter">Emin misiniz?</span>
                                                            <button
                                                                onClick={() => handleDelete(listing.id!, listing.images)}
                                                                className="bg-[#E10600] text-white text-[10px] px-3 py-1.5 rounded-lg hover:bg-[#C00500] transition-colors uppercase font-bold shadow-md shadow-[#E10600]/20"
                                                            >
                                                                Evet, Sil
                                                            </button>
                                                            <button
                                                                onClick={() => setDeletingId(null)}
                                                                className="bg-white text-neutral-400 text-[10px] px-3 py-1.5 rounded-lg hover:text-black border border-neutral-400/30 transition-colors uppercase font-bold"
                                                            >
                                                                İptal
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => router.push(`/admin/edit/${listing.id}`)}
                                                                className="w-10 h-10 bg-white border border-neutral-400/30 rounded-xl flex items-center justify-center text-neutral-400 hover:text-[#E10600] hover:border-[#E10600] transition-all shadow-sm"
                                                                title="Düzenle"
                                                            >
                                                                <Pencil size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => setDeletingId(listing.id!)}
                                                                className="w-10 h-10 bg-white border border-neutral-400/30 rounded-xl flex items-center justify-center text-neutral-400 hover:text-[#E10600] hover:border-[#E10600] transition-all shadow-sm"
                                                                title="Sil"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                            <Link
                                                                href={`/ilanlar/${listing.details?.listingId || listing.id}`}
                                                                target="_blank"
                                                                className="w-10 h-10 bg-white border border-neutral-400/30 rounded-xl flex items-center justify-center text-neutral-400 hover:text-black hover:border-black transition-all shadow-sm"
                                                                title="Görüntüle"
                                                            >
                                                                <ExternalLink size={16} />
                                                            </Link>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AdminGuard>
    );
}
