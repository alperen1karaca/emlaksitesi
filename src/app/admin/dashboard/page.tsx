"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Edit2, Trash2, ExternalLink, Filter, Loader2, Layout, User } from "lucide-react";
import { db, auth } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Listing } from "@/types/listing";

export default function AdminDashboard() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            // if (!user) {
            //     router.push("/admin");
            // }
        });

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
            unsubscribeAuth();
            unsubscribeListings();
        };
    }, []);

    const handleDelete = async (id: string, imageUrls?: string[]) => {
        if (confirm("Bu ilanı silmek istediğinize emin misiniz?")) {
            try {
                // Delete from R2 first
                if (imageUrls && imageUrls.length > 0) {
                    await fetch("/api/delete", {
                        method: "POST",
                        body: JSON.stringify({ urls: imageUrls }),
                    });
                }

                // Then delete from Firestore
                await deleteDoc(doc(db, "listings", id));
            } catch (error) {
                console.error("Silme hatası:", error);
                alert("İlan silinirken bir hata oluştu.");
            }
        }
    };

    const filteredListings = listings.filter(l =>
        l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.details?.listingId?.includes(searchTerm)
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-primary" size={40} />
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400">Veriler Yükleniyor...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white p-6">
                <div className="max-w-md w-full text-center space-y-4">
                    <div className="text-red-500 bg-red-50 p-6 rounded-3xl border border-red-100 font-bold">
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
        <div className="min-h-screen bg-gray-50 p-8 lg:p-12 text-secondary">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter mb-2 uppercase text-secondary">Yönetim Paneli</h1>
                        <p className="text-gray-400 font-medium tracking-tight">Toplam <span className="text-primary font-black">{listings.length}</span> İlan Portföyde</p>
                    </div>
                    <Link href="/admin/add" className="premium-button flex items-center gap-3 px-10 py-4 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]">
                        <Plus size={20} />
                        Yeni İlan Ekle
                    </Link>
                    <Link href="/admin/hero" className="flex items-center gap-3 px-10 py-4 bg-secondary text-white rounded-full font-bold shadow-xl shadow-secondary/10 hover:scale-[1.02] transition-all">
                        <Layout size={20} />
                        Slayt Yönetimi
                    </Link>
                    <Link href="/admin/agents" className="flex items-center gap-3 px-10 py-4 bg-primary text-white rounded-full font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
                        <User size={20} />
                        Danışman Yönetimi
                    </Link>
                </div>

                <div className="mb-8 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 bg-white border border-gray-100 rounded-2xl flex items-center gap-4 px-6 py-4 shadow-sm">
                        <Search className="text-primary/60" size={20} />
                        <input
                            type="text"
                            placeholder="İlan başlığı veya ID ile ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent border-none outline-none text-secondary w-full placeholder:text-gray-300 font-bold"
                        />
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-50 bg-gray-50/50">
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Görsel & Başlık</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">Tür</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Fiyat</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Tarih</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 font-medium">
                                {filteredListings.map((listing) => (
                                    <tr key={listing.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 bg-gray-100 rounded-xl shrink-0 overflow-hidden border border-gray-100">
                                                    {listing.images && listing.images[0] ? (
                                                        <img src={listing.images[0]} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-primary/5 flex items-center justify-center">
                                                            <Plus size={20} className="text-primary/20" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-secondary font-black group-hover:text-primary transition-colors line-clamp-1">{listing.title}</span>
                                                    <span className="text-[10px] text-gray-400 uppercase tracking-widest mt-1 font-bold">{listing.details?.propertyType}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${listing.type === "SATILIK" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
                                                }`}>
                                                {listing.type}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right font-black text-secondary">
                                            {listing.price.toLocaleString("tr-TR")} TL
                                        </td>
                                        <td className="px-8 py-6 text-right text-gray-400 text-xs font-bold uppercase italic">
                                            {listing.createdAt?.toDate().toLocaleDateString("tr-TR") || "..."}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex justify-center gap-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => router.push(`/admin/edit/${listing.id}`)}
                                                    className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary transition-all shadow-sm"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(listing.id!, listing.images)}
                                                    className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-500 transition-all shadow-sm"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                                <Link href={`/ilanlar/${listing.id}`} target="_blank" className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-secondary hover:border-secondary transition-all shadow-sm">
                                                    <ExternalLink size={16} />
                                                </Link>
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
    );
}
