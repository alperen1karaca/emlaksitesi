"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import {
    Check,
    Trash2,
    Pencil,
    Eye,
    ArrowLeft,
    Loader2,
    AlertCircle
} from "lucide-react";
import Link from "next/link";
import AdminGuard from "@/components/admin/AdminGuard";
import { Listing } from "@/types/listing";

export default function AdminApplicationsPage() {
    const [applications, setApplications] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [confirmingAction, setConfirmingAction] = useState<{ id: string, type: 'approve' | 'delete' } | null>(null);
    const router = useRouter();

    useEffect(() => {
        const q = query(
            collection(db, "listings"),
            where("status", "==", "pending")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Listing[];

            // Sort by creation date if available
            items.sort((a, b) => {
                const timeA = a.createdAt?.seconds || 0;
                const timeB = b.createdAt?.seconds || 0;
                return timeB - timeA;
            });

            setApplications(items);
            setLoading(false);
        }, (error) => {
            console.error("Fetch error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleApprove = (id: string) => {
        console.log("Approval trigger clicked for ID:", id);
        setConfirmingAction({ id, type: 'approve' });
    };

    const confirmApprove = async (id: string) => {
        console.log("Confirming approval for ID:", id);
        setConfirmingAction(null);
        setActionLoading(id);
        try {
            const docRef = doc(db, "listings", id);
            await setDoc(docRef, {
                status: "approved",
                updatedAt: new Date()
            }, { merge: true });
            console.log("Firestore update successful for ID:", id);
            alert("İlan onaylandı!");
        } catch (error: any) {
            console.error("APP_ERROR:", error);
            alert(`Hata: ${error.code || error.message || "İşlem başarısız"}`);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = (id: string) => {
        console.log("Delete trigger clicked for ID:", id);
        setConfirmingAction({ id, type: 'delete' });
    };

    const confirmDelete = async (id: string) => {
        console.log("Confirming delete for ID:", id);
        setConfirmingAction(null);
        setActionLoading(id);
        try {
            await deleteDoc(doc(db, "listings", id));
            console.log("Firestore delete successful for ID:", id);
            alert("Başvuru silindi.");
        } catch (error: any) {
            console.error("DELETE_ERROR:", error);
            alert(`Silme hatası: ${error.message}`);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="animate-spin text-[#E10600]" size={48} />
            </div>
        );
    }

    return (
        <AdminGuard>
            <div className="min-h-screen bg-neutral-100 p-8 lg:p-12">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                        <div>
                            <Link
                                href="/admin/dashboard"
                                className="inline-flex items-center gap-2 text-neutral-400 hover:text-[#E10600] transition-colors font-bold uppercase tracking-widest text-[10px] mb-4 group"
                            >
                                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                                Panel'e Geri Dön
                            </Link>
                            <h1 className="text-4xl font-black tracking-tighter uppercase text-black">İlan Başvuruları</h1>
                            <p className="text-neutral-400 font-medium">Şu an onay bekleyen <span className="text-[#E10600] font-black">{applications.length}</span> başvuru bulunuyor.</p>
                        </div>
                    </div>

                    {applications.length > 0 ? (
                        <>
                            {/* Mobile Card Layout */}
                            <div className="flex flex-col gap-4 md:hidden">
                                {applications.map((app) => (
                                    <div key={app.id} className="bg-white rounded-2xl border border-neutral-400/30 shadow-sm p-5">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden border border-neutral-400/30 flex-shrink-0">
                                                {app.images?.[0] ? (
                                                    <img src={app.images[0]} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-neutral-400/70 text-xs">—</div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-black font-black text-sm truncate">{app.title}</div>
                                                <div className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold mt-0.5">{app.details.propertyType}</div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-4">
                                            <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black tracking-widest text-black">{app.category}</span>
                                            <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black tracking-widest text-black">{app.type}</span>
                                        </div>

                                        <div className="flex justify-between items-center mb-4 text-sm">
                                            <div>
                                                <span className="text-neutral-400 text-[10px] uppercase tracking-widest font-bold block">Fiyat</span>
                                                <span className="text-black font-black">{app.price.toLocaleString("tr-TR")} TL</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-neutral-400 text-[10px] uppercase tracking-widest font-bold block">Konum</span>
                                                <span className="text-black font-bold text-xs">{app.location.district}{app.location.neighborhood && ` / ${app.location.neighborhood}`}</span>
                                            </div>
                                        </div>

                                        <div className="border-t border-neutral-100 pt-3">
                                            {confirmingAction && confirmingAction.id === app.id ? (
                                                <div className="flex items-center gap-2 justify-center">
                                                    <span className="text-[10px] font-black uppercase text-black">Emin misiniz?</span>
                                                    <button
                                                        onClick={() => confirmingAction.type === 'approve' ? confirmApprove(app.id!) : confirmDelete(app.id!)}
                                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase text-white ${confirmingAction.type === 'approve' ? 'bg-green-500' : 'bg-red-500'}`}
                                                    >
                                                        Evet
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmingAction(null)}
                                                        className="px-4 py-2 rounded-xl text-[10px] font-black uppercase bg-white text-neutral-400 border border-neutral-400/30"
                                                    >
                                                        Hayır
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex gap-2 justify-center">
                                                    <button
                                                        onClick={() => handleApprove(app.id!)}
                                                        disabled={actionLoading === app.id}
                                                        className="flex-1 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center gap-1.5 text-[10px] font-black uppercase hover:bg-green-600 hover:text-white transition-all border border-green-100 disabled:opacity-50"
                                                    >
                                                        {actionLoading === app.id ? <Loader2 size={14} className="animate-spin" /> : <><Check size={14} /> Onayla</>}
                                                    </button>
                                                    <button
                                                        onClick={() => router.push(`/admin/edit/${app.id}`)}
                                                        className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all border border-blue-100"
                                                    >
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(app.id!)}
                                                        disabled={actionLoading === app.id}
                                                        className="h-10 w-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all border border-red-100 disabled:opacity-50"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                    <Link
                                                        href={`/ilanlar/${app.details?.listingId || app.id}`}
                                                        target="_blank"
                                                        className="h-10 w-10 bg-neutral-100 text-neutral-400 rounded-xl flex items-center justify-center hover:bg-black hover:text-white transition-all border border-neutral-400/30"
                                                    >
                                                        <Eye size={14} />
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop Table Layout */}
                            <div className="hidden md:block bg-white rounded-[40px] border border-neutral-400/30 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-gray-50 bg-neutral-100/50 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
                                                <th className="px-8 py-6">İlan Bilgisi</th>
                                                <th className="px-8 py-6">Kategori</th>
                                                <th className="px-8 py-6">Fiyat</th>
                                                <th className="px-8 py-6">Konum</th>
                                                <th className="px-8 py-6 text-center">İşlemler</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 font-medium italic">
                                            {applications.map((app) => (
                                                <tr key={app.id} className="hover:bg-neutral-100/50 transition-colors group not-italic">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden border border-neutral-400/30">
                                                                {app.images?.[0] ? (
                                                                    <img src={app.images[0]} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-neutral-400/70 italic">No Pic</div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="text-black font-black line-clamp-1">{app.title}</div>
                                                                <div className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold mt-1">{app.details.propertyType}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black tracking-widest text-black">{app.category}</span>
                                                    </td>
                                                    <td className="px-8 py-6 font-black text-black">
                                                        {app.price.toLocaleString("tr-TR")} TL
                                                    </td>
                                                    <td className="px-8 py-6 text-neutral-400 text-[11px] font-bold uppercase tracking-tight">
                                                        {app.location.district}
                                                        {app.location.neighborhood && ` / ${app.location.neighborhood}`}
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex justify-center items-center gap-2">
                                                            {confirmingAction && confirmingAction.id === app.id ? (
                                                                <div className="flex items-center gap-2 bg-neutral-100 p-1 rounded-xl border border-neutral-400/30 whitespace-nowrap">
                                                                    <span className="text-[9px] font-black uppercase text-black px-2 italic">Emin misiniz?</span>
                                                                    <button
                                                                        onClick={() => confirmingAction.type === 'approve' ? confirmApprove(app.id!) : confirmDelete(app.id!)}
                                                                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-white transition-all shadow-sm ${confirmingAction.type === 'approve' ? 'bg-green-500 hover:bg-green-600 shadow-green-200' : 'bg-red-500 hover:bg-red-600 shadow-red-200'}`}
                                                                    >
                                                                        Evet
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setConfirmingAction(null)}
                                                                        className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-white text-neutral-400 border border-neutral-400/30 hover:text-black transition-all"
                                                                    >
                                                                        Hayır
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleApprove(app.id!)}
                                                                        disabled={actionLoading === app.id}
                                                                        className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center hover:bg-green-600 hover:text-white transition-all border border-green-100 disabled:opacity-50"
                                                                        title="Onayla"
                                                                    >
                                                                        {actionLoading === app.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={18} />}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => router.push(`/admin/edit/${app.id}`)}
                                                                        className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all border border-blue-100"
                                                                        title="Düzenle"
                                                                    >
                                                                        <Pencil size={18} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDelete(app.id!)}
                                                                        disabled={actionLoading === app.id}
                                                                        className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all border border-red-100 disabled:opacity-50"
                                                                        title="Sil"
                                                                    >
                                                                        {actionLoading === app.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={18} />}
                                                                    </button>
                                                                    <Link
                                                                        href={`/ilanlar/${app.details?.listingId || app.id}`}
                                                                        target="_blank"
                                                                        className="w-10 h-10 bg-neutral-100 text-neutral-400 rounded-xl flex items-center justify-center hover:bg-black hover:text-white transition-all border border-neutral-400/30"
                                                                        title="Önizleme"
                                                                    >
                                                                        <Eye size={18} />
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
                        </>

                    ) : (
                        <div className="py-40 bg-white rounded-[40px] border-2 border-dashed border-neutral-400/30 flex flex-col items-center justify-center gap-6 text-center shadow-sm">
                            <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center text-3xl">📭</div>
                            <div>
                                <h3 className="text-black font-black uppercase tracking-widest mb-2">Başvuru Bulunmuyor</h3>
                                <p className="text-neutral-400 text-sm max-w-xs mx-auto font-medium">Şu an onay bekleyen herhangi bir ilan başvurusu yok.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminGuard>
    );
}
