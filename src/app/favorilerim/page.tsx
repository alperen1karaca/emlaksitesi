"use client";
import React, { useEffect, useState } from "react";
import {
    Heart,
    Loader2,
    ArrowLeft,
    Search,
    ChevronRight,
    Home
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, getDoc, doc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import ListingCard from "@/components/listings/ListingCard";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function FavoritesPage() {
    const [listings, setListings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { user, loading: authLoading } = useAuth();

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            setLoading(false);
            return;
        }

        const favRef = collection(db, "users", user.uid, "favorites");
        const unsubscribe = onSnapshot(favRef, async (snapshot) => {
            const favIds = snapshot.docs.map(doc => doc.id);

            if (favIds.length === 0) {
                setListings([]);
                setLoading(false);
                return;
            }

            // Fetch full listing details for each favorite
            // In a real high-traffic app, we'd use a more optimized batch fetch
            const fetchedListings = await Promise.all(
                favIds.map(async (id) => {
                    const listingSnap = await getDoc(doc(db, "listings", id));
                    if (listingSnap.exists()) {
                        return { id: listingSnap.id, ...listingSnap.data() };
                    }
                    return null;
                })
            );

            setListings(fetchedListings.filter(l => l !== null));
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, authLoading]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
                <div className="bg-white p-12 rounded-[3rem] shadow-xl text-center max-w-md border border-gray-100">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 text-primary">
                        <Heart size={36} />
                    </div>
                    <h1 className="text-2xl font-black text-secondary uppercase tracking-tight mb-4">Favorilerini Gör</h1>
                    <p className="text-gray-500 font-medium mb-10 tracking-tight">İlanları kaydetmek ve favorilerini görmek için lütfen önce giriş yap.</p>
                    <Link
                        href="/login"
                        className="premium-button block px-12 py-4 uppercase text-xs font-black tracking-widest shadow-lg shadow-primary/20"
                    >
                        Giriş Yap
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <section className="pt-32 pb-12 bg-white border-b border-gray-100 px-6">
                <div className="max-w-[1400px] mx-auto">
                    <div className="flex items-center gap-6 mb-8">
                        <Link
                            href="/ilanlar"
                            className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-secondary hover:text-primary transition-all border border-gray-100"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black text-secondary tracking-tighter uppercase mb-1">Favori İlanlarım</h1>
                            <p className="text-gray-400 text-sm font-medium tracking-tight">Kişisel listenizde <span className="text-primary font-black">{listings.length}</span> ilan kayıtlı.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20 px-6">
                <div className="max-w-[1400px] mx-auto">
                    <AnimatePresence mode="popLayout">
                        {listings.length > 0 ? (
                            <motion.div
                                layout
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                            >
                                {listings.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                        layout
                                    >
                                        <ListingCard
                                            id={item.id}
                                            listingNumber={item.details?.listingId}
                                            title={item.title}
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
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="py-32 text-center text-gray-400 font-bold border-2 border-dashed border-gray-200 rounded-[50px] flex flex-col items-center gap-8 bg-white"
                            >
                                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-4xl shadow-inner animate-pulse">
                                    ❤️
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="uppercase tracking-[0.3em] text-[10px] font-black">Henüz hiç ilan kaydetmediniz</div>
                                    <p className="text-sm font-medium text-gray-300 max-w-xs mx-auto">Hayalinizdeki gayrimenkulü bulmak için ilanlarımıza göz atın.</p>
                                </div>
                                <Link
                                    href="/ilanlar"
                                    className="bg-secondary text-white px-10 py-4 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all shadow-xl shadow-secondary/10"
                                >
                                    İlanları İncele
                                    <ChevronRight size={14} />
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>
        </div>
    );
}
