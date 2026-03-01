"use client";
import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2, Image as ImageIcon, ChevronRight, Layout, ArrowLeft } from "lucide-react";
import { db, auth } from "@/lib/firebase";
import Link from "next/link";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, addDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { HeroSlide } from "@/types/listing";
import HeroSlideForm from "@/components/admin/HeroSlideForm";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminHeroSlider() {
    const [slides, setSlides] = useState<HeroSlide[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (!user) router.push("/admin");
        });

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
            unsubscribeAuth();
            unsubscribeSlides();
        };
    }, []);

    const handleDelete = async (id: string, imageUrl: string) => {
        if (confirm("Bu slaytı silmek istediğinize emin misiniz?")) {
            try {
                // Delete from R2 first
                if (imageUrl) {
                    await fetch("/api/delete", {
                        method: "POST",
                        body: JSON.stringify({ urls: [imageUrl] }),
                    });
                }

                // Then delete from Firestore
                await deleteDoc(doc(db, "hero_slides", id));
            } catch (error) {
                console.error("Silme hatası:", error);
                alert("Slayt silinirken bir hata oluştu.");
            }
        }
    };

    const handleAddSlide = async (data: any, imageUrl: string) => {
        console.log("handleAddSlide started in parent...", { data, imageUrl });
        setSubmitting(true);
        try {
            console.log("Adding document to Firestore 'hero_slides' collection...");
            const docRef = await addDoc(collection(db, "hero_slides"), {
                ...data,
                imageUrl,
                createdAt: serverTimestamp()
            });
            console.log("Document added successfully with ID:", docRef.id);
            setShowAddForm(false);
        } catch (error: any) {
            console.error("Ekleme hatası (Parent):", error);
            alert("Slayt eklenirken bir hata oluştu: " + error.message);
        } finally {
            setSubmitting(false);
            console.log("handleAddSlide finished in parent.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8 lg:p-12 text-secondary">
            <div className="max-w-6xl mx-auto">
                <Link
                    href="/admin/dashboard"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-primary transition-colors font-bold uppercase tracking-widest text-[10px] mb-8 group"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    Panel'e Geri Dön
                </Link>

                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 uppercase">
                    <div>
                        <div className="flex items-center gap-3 text-primary font-black tracking-widest text-[10px] mb-2 uppercase">
                            <Layout size={14} />
                            <span>Ana Sayfa Görünümü</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter uppercase text-secondary">Slayt Yönetimi</h1>
                    </div>
                    {!showAddForm && (
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="premium-button flex items-center gap-3 px-10 py-4 shadow-xl shadow-primary/20"
                        >
                            <Plus size={20} />
                            Yeni Slayt Ekle
                        </button>
                    )}
                </header>

                <AnimatePresence>
                    {showAddForm && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mb-12"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-black tracking-tight uppercase">Yeni Slayt Ekle</h2>
                                <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-primary transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                            <HeroSlideForm onSubmit={handleAddSlide} loading={submitting} />
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {slides.map((slide) => (
                        <motion.div
                            layout
                            key={slide.id}
                            className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm group hover:shadow-xl hover:shadow-primary/5 transition-all duration-500"
                        >
                            <div className="relative aspect-[16/9] overflow-hidden">
                                <img src={slide.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                                <div className="absolute top-4 left-4 bg-secondary/80 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                                    Sıra: {slide.order}
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
                                    <h4 className="text-white font-black uppercase tracking-tight line-clamp-1">{slide.title || "Başlıksız Slayt"}</h4>
                                    <p className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1 line-clamp-1">{slide.subtitle || "Alt başlık yok"}</p>
                                </div>
                            </div>
                            <div className="p-6 flex justify-between items-center bg-white">
                                <div className="flex gap-2">
                                    {/* Edit could be added later if needed */}
                                </div>
                                <button
                                    onClick={() => handleDelete(slide.id!, slide.imageUrl)}
                                    className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    {slides.length === 0 && !showAddForm && (
                        <div className="md:col-span-2 py-20 bg-white rounded-[40px] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center mb-6">
                                <ImageIcon className="text-primary/20" size={40} />
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tight text-secondary">Henüz Slayt Eklenmemiş</h3>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2">Ana sayfa slider'ı için görsel ekleyerek başlayın.</p>
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="mt-8 text-primary font-black uppercase tracking-widest text-xs hover:underline flex items-center gap-2"
                            >
                                <Plus size={16} />
                                İlk Slaytı Ekle
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function X({ size, className }: { size?: number, className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
        </svg>
    );
}
