"use client";
import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter, useParams } from "next/navigation";
import ListingForm from "@/components/admin/ListingForm";
import { Listing } from "@/types/listing";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditListingPage() {
    const { id } = useParams();
    const router = useRouter();
    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) router.push("/admin");
        });

        const fetchListing = async () => {
            if (!id) return;
            try {
                const docSnap = await getDoc(doc(db, "listings", id as string));
                if (docSnap.exists()) {
                    setListing({ id: docSnap.id, ...docSnap.data() } as Listing);
                } else {
                    alert("İlan bulunamadı.");
                    router.push("/admin/dashboard");
                }
            } catch (error) {
                console.error("Hata:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchListing();
        return () => unsubscribe();
    }, [id]);

    const handleUpdate = async (formData: any, imageUrls: string[]) => {
        setSaving(true);
        try {
            await updateDoc(doc(db, "listings", id as string), {
                ...formData,
                images: imageUrls,
                price: Number(formData.price),
                updatedAt: serverTimestamp(),
            });

            alert("İlan başarıyla güncellendi!");
            router.push("/admin/dashboard");
        } catch (error) {
            console.error("Hata:", error);
            alert("İlan güncellenirken bir hata oluştu.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-primary" size={40} />
            </div>
        );
    }

    if (!listing) return null;

    return (
        <div className="min-h-screen bg-gray-50 p-6 lg:p-12">
            <div className="max-w-6xl mx-auto">
                <Link
                    href="/admin/dashboard"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-primary transition-colors font-bold uppercase tracking-widest text-[10px] mb-8 group"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    Panel'e Geri Dön
                </Link>
                <ListingForm initialData={listing} onSubmit={handleUpdate} loading={saving} />
            </div>
        </div>
    );
}
