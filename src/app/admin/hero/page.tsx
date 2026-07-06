"use client";
import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2, Image as ImageIcon, ChevronRight, Layout, ArrowLeft, X } from "lucide-react";
import { db, auth } from "@/lib/firebase";
import Link from "next/link";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, addDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { HeroSlide } from "@/types/listing";
import HeroSlideForm from "@/components/admin/HeroSlideForm";
import { motion, AnimatePresence } from "framer-motion";
import AdminGuard from "@/components/admin/AdminGuard";

export default function AdminHeroSlider() {
    const [slides, setSlides] = useState<HeroSlide[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
    const router = useRouter();

    useEffect(() => {
        const q = query(collection(db, "hero_slides"), orderBy("order", "asc"));
        const unsubscribeSlides = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as HeroSlide[];
            setSlides(items);
            setLoading(false);
        });

        return () => {
            unsubscribeSlides();
        };
    }, []);

    const handleDelete = async (id: string, imageUrl?: string, videoUrl?: string) => {
        if (confirm("Bu slaytı silmek istediğinize emin misiniz?")) {
            try {
                const urlsToDelete = [imageUrl, videoUrl].filter(Boolean) as string[];
                if (urlsToDelete.length > 0) {
                    try {
                        await fetch("/api/delete", {
                            method: "POST",
                            body: JSON.stringify({ urls: urlsToDelete }),
                        });
                    } catch (r2Error) {
                        console.warn("R2 deletion failed, continuing with Firestore deletion:", r2Error);
                    }
                }
                await deleteDoc(doc(db, "hero_slides", id));
            } catch (error) {
                console.error("Silme hatası:", error);
                alert("Slayt silinirken bir hata oluştu.");
            }
        }
    };

    const handleAddSlide = async (data: any, imageUrl: string) => {
        setSubmitting(true);
        try {
            await addDoc(collection(db, "hero_slides"), {
                ...data,
                imageUrl,
                createdAt: serverTimestamp()
            });
            setShowAddForm(false);
        } catch (error: any) {
            console.error("Ekleme hatası:", error);
            alert("Slayt eklenirken bir hata oluştu: " + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateSlide = async (data: any, imageUrl: string) => {
        if (!editingSlide?.id) return;
        setSubmitting(true);
        try {
            await updateDoc(doc(db, "hero_slides", editingSlide.id), {
                ...data,
                imageUrl,
                updatedAt: serverTimestamp()
            });
            setEditingSlide(null);
        } catch (error: any) {
            console.error("Güncelleme hatası:", error);
            alert("Slayt güncellenirken bir hata oluştu: " + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="animate-spin text-[#E10600]" size={40} />
            </div>
        );
    }

    return (
        <AdminGuard>
            <div className="min-h-screen bg-neutral-100 p-8 lg:p-12 text-black">
                <div className="max-w-6xl mx-auto">
                    <Link
                        href="/admin/dashboard"
                        className="inline-flex items-center gap-2 text-neutral-400 hover:text-[#E10600] transition-colors font-bold uppercase tracking-widest text-[10px] mb-8 group"
                    >
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        Panel'e Geri Dön
                    </Link>

                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 uppercase">
                        <div>
                            <div className="flex items-center gap-3 text-[#E10600] font-black tracking-widest text-[10px] mb-2 uppercase">
                                <Layout size={14} />
                                <span>Ana Sayfa Görünümü</span>
                            </div>
                            <h1 className="text-4xl font-black tracking-tighter uppercase text-black">Slayt Yönetimi</h1>
                        </div>
                        {(!showAddForm && !editingSlide) && (
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="premium-button flex items-center gap-3 px-10 py-4 shadow-xl shadow-[#E10600]/20"
                            >
                                <Plus size={20} />
                                Yeni Slayt Ekle
                            </button>
                        )}
                    </header>

                    <AnimatePresence>
                        {(showAddForm || editingSlide) && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="mb-12"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-black tracking-tight uppercase">
                                        {editingSlide ? "Slaytı Düzenle" : "Yeni Slayt Ekle"}
                                    </h2>
                                    <button 
                                        onClick={() => {
                                            setShowAddForm(false);
                                            setEditingSlide(null);
                                        }} 
                                        className="text-neutral-400 hover:text-[#E10600] transition-colors"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>
                                <HeroSlideForm 
                                    initialData={editingSlide || undefined} 
                                    onSubmit={editingSlide ? handleUpdateSlide : handleAddSlide} 
                                    loading={submitting} 
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {slides.map((slide) => (
                            <motion.div
                                layout
                                key={slide.id}
                                className="bg-white rounded-3xl overflow-hidden border border-neutral-400/30 shadow-sm group hover:shadow-xl hover:shadow-[#E10600]/5 transition-all duration-500"
                            >
                                <div className="relative aspect-[16/9] overflow-hidden bg-neutral-100">
                                    {slide.videoUrl ? (
                                        <video src={slide.videoUrl} className="w-full h-full object-cover" muted loop autoPlay playsInline />
                                    ) : (
                                        <img src={slide.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                                    )}
                                    <div className="absolute top-4 left-4 flex gap-2">
                                        <div className="bg-black/80 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                                            Sıra: {slide.order}
                                        </div>
                                        {slide.videoUrl && (
                                            <div className="bg-[#E10600] text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                                                VIDEO
                                            </div>
                                        )}
                                        {slide.videoUrl && (() => {
                                            const tMatch = slide.videoUrl.match(/#.*t=([0-9.]+),([0-9.]+)/);
                                            if (tMatch) {
                                                return (
                                                    <div className="bg-white/90 text-black px-3 py-1 rounded-lg text-[10px] font-black tracking-widest backdrop-blur-md">
                                                        ✂️ {parseFloat(tMatch[1]).toFixed(1)}s — {parseFloat(tMatch[2]).toFixed(1)}s
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()}
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
                                        <h4 className="text-white font-black uppercase tracking-tight line-clamp-1">{slide.title || "Başlıksız Slayt"}</h4>
                                        <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1 line-clamp-1">{slide.subtitle || "Alt başlık yok"}</p>
                                        {slide.duration && (
                                            <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest mt-1">⏱ {slide.duration}s süre</p>
                                        )}

                                    </div>
                                </div>
                                <div className="p-6 flex justify-between items-center bg-white">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setEditingSlide(slide);
                                                setShowAddForm(false);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            className="px-6 py-2.5 bg-neutral-100 text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all border border-neutral-200"
                                        >
                                            Düzenle
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(slide.id!, slide.imageUrl, slide.videoUrl)}
                                        className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}

                        {slides.length === 0 && !showAddForm && (
                            <div className="md:col-span-2 py-20 bg-white rounded-[40px] border-2 border-dashed border-neutral-400/30 flex flex-col items-center justify-center text-center">
                                <div className="w-20 h-20 bg-[#E10600]/5 rounded-3xl flex items-center justify-center mb-6">
                                    <ImageIcon className="text-[#E10600]/20" size={40} />
                                </div>
                                <h3 className="text-xl font-black uppercase tracking-tight text-black">Henüz Slayt Eklenmemiş</h3>
                                <p className="text-neutral-400 font-bold uppercase tracking-widest text-[10px] mt-2">Ana sayfa slider'ı için görsel ekleyerek başlayın.</p>
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="mt-8 text-[#E10600] font-black uppercase tracking-widest text-xs hover:underline flex items-center gap-2"
                                >
                                    <Plus size={16} />
                                    İlk Slaytı Ekle
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminGuard>
    );
}
