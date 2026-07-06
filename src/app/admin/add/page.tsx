"use client";
import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import ListingForm from "@/components/admin/ListingForm";
import AdminGuard from "@/components/admin/AdminGuard";
import { generateListingId } from "@/lib/generateListingId";

export default function AddListingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    /*
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) router.push("/admin");
        });
        return () => unsubscribe();
    }, []);
    */

    const handleSave = async (formData: any, imageUrls: string[]) => {
        setLoading(true);
        try {
            // Auto-generate listing ID
            const listingId = await generateListingId();

            await addDoc(collection(db, "listings"), {
                ...formData,
                images: imageUrls,
                price: Number(formData.price),
                status: "approved",
                createdAt: serverTimestamp(),
                details: {
                    ...formData.details,
                    listingId: listingId,
                },
            });

            alert(`İlan başarıyla yayınlandı! İlan No: ${listingId}`);
            router.push("/admin/dashboard");
        } catch (error) {
            console.error("Hata:", error);
            alert("İlan kaydedilirken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminGuard>
            <div className="min-h-screen bg-neutral-100 p-6 lg:p-12">
                <div className="max-w-6xl mx-auto">
                    <Link
                        href="/admin/dashboard"
                        className="inline-flex items-center gap-2 text-neutral-400 hover:text-[#E10600] transition-colors font-bold uppercase tracking-widest text-[10px] mb-8 group"
                    >
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        Panel'e Geri Dön
                    </Link>
                    <ListingForm onSubmit={handleSave} loading={loading} />
                </div>
            </div>
        </AdminGuard>
    );
}
