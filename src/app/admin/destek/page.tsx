"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import AdminGuard from "@/components/admin/AdminGuard";
import { Loader2, Trash2, MessageSquare, Clock, User, Phone } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface ContactMessage {
    id: string;
    name: string;
    phone: string;
    message: string;
    status: string;
    createdAt?: {
        seconds: number;
        nanoseconds: number;
    };
}

export default function SupportMessagesPage() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        const q = query(collection(db, "contact_messages"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as ContactMessage[];
            setMessages(items);
            setLoading(false);
        }, (error) => {
            console.error("Mesajlar yüklenirken hata:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleMarkAsRead = async (id: string) => {
        try {
            await updateDoc(doc(db, "contact_messages", id), {
                status: 'READ'
            });
        } catch (error) {
            console.error("Mesaj güncellenirken hata:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
            // Development fallback or optimistic UI if needed
        }
        if (confirm("Bu mesajı silmek istediğinize emin misiniz?")) {
            setDeletingId(id);
            try {
                await deleteDoc(doc(db, "contact_messages", id));
            } catch (error) {
                console.error("Mesaj silinirken hata:", error);
                alert("Mesaj silinemedi.");
            } finally {
                setDeletingId(null);
            }
        }
    };

    const formatDate = (timestamp?: { seconds: number }) => {
        if (!timestamp) return "Tarih Yok";
        const date = new Date(timestamp.seconds * 1000);
        return new Intl.DateTimeFormat("tr-TR", {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    if (loading) {
        return (
            <AdminGuard>
                <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-6">
                    <Loader2 className="animate-spin text-[#E10600]" size={40} />
                </div>
            </AdminGuard>
        );
    }

    return (
        <AdminGuard>
            <div className="min-h-screen bg-neutral-100 p-8 lg:p-12 text-black">
                <div className="max-w-7xl mx-auto">
                    
                    {/* Header */}
                    <div className="mb-10">
                        <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-neutral-400 hover:text-[#E10600] transition-colors mb-6 font-bold text-sm uppercase tracking-wider">
                            <ArrowLeft size={16} />
                            Panele Dön
                        </Link>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                            <div>
                                <h1 className="text-4xl font-black tracking-tighter mb-2 uppercase text-black flex items-center gap-4">
                                    <MessageSquare className="text-[#E10600]" />
                                    Destek Talepleri
                                </h1>
                                <p className="text-neutral-400 font-medium tracking-tight">
                                    Toplam <span className="text-[#E10600] font-black">{messages.length}</span> mesaj bulunuyor.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Messages Grid */}
                    {messages.length === 0 ? (
                        <div className="bg-white p-16 text-center rounded-3xl border border-neutral-400/20 shadow-sm">
                            <MessageSquare size={48} className="mx-auto text-neutral-400/30 mb-4" />
                            <h3 className="text-xl font-black text-black uppercase tracking-tight mb-2">Henüz Mesaj Yok</h3>
                            <p className="text-neutral-400 font-medium">İletişim formu üzerinden gönderilen yeni bir destek talebi bulunmamaktadır.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {messages.map((message) => (
                                <div 
                                    key={message.id} 
                                    className={`bg-white p-8 rounded-[2rem] border transition-all group relative overflow-hidden shadow-sm hover:shadow-xl ${
                                        message.status === 'NEW' ? 'border-[#E10600]/30 ring-1 ring-[#E10600]/10' : 'border-neutral-400/20'
                                    }`}
                                    onClick={() => message.status === 'NEW' && handleMarkAsRead(message.id)}
                                >
                                    
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-black font-black text-lg">
                                                <User size={18} className="text-[#E10600]" />
                                                {message.name}
                                            </div>
                                            <div className="flex items-center gap-2 text-neutral-500 font-bold text-sm">
                                                <Phone size={14} className="text-neutral-400" />
                                                <a href={`tel:${message.phone}`} className="hover:text-[#E10600] transition-colors">
                                                    {message.phone}
                                                </a>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center justify-end gap-1 text-[10px] text-neutral-400 uppercase tracking-widest font-black mb-2">
                                                <Clock size={12} />
                                                {formatDate(message.createdAt)}
                                            </div>
                                            {message.status === 'NEW' && (
                                                <span className="bg-[#E10600]/10 text-[#E10600] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest inline-block">
                                                    YENİ
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-neutral-50 p-5 rounded-2xl mb-6 border border-neutral-100">
                                        <p className="text-neutral-800 text-sm leading-relaxed font-medium whitespace-pre-wrap">
                                            {message.message}
                                        </p>
                                    </div>

                                    <div className="flex justify-end border-t border-neutral-100 pt-6 mt-2">
                                        <button
                                            onClick={() => handleDelete(message.id)}
                                            disabled={deletingId === message.id}
                                            className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-neutral-400 hover:text-[#E10600] hover:bg-[#E10600]/5 px-4 py-2 rounded-xl transition-all disabled:opacity-50"
                                        >
                                            {deletingId === message.id ? (
                                                <Loader2 size={16} className="animate-spin" />
                                            ) : (
                                                <Trash2 size={16} />
                                            )}
                                            Mesajı Sil
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminGuard>
    );
}
