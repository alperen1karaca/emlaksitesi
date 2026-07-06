"use client";

import { useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import ListingForm from "@/components/admin/ListingForm";
import { useAuth } from "@/context/AuthContext";
import { Listing } from "@/types/listing";
import { generateListingId } from "@/lib/generateListingId";

export default function SubmitListingPage() {
    const router = useRouter();
    const { user, isAdmin, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(false);

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    if (!user) {
        router.push("/login?redirect=/ilan-ver");
        return null;
    }

    const handleSave = async (formData: Omit<Listing, "id" | "createdAt" | "images" | "status">, imageUrls: string[]) => {
        setLoading(true);
        try {
            // Auto-generate listing ID
            const listingId = await generateListingId();

            await addDoc(collection(db, "listings"), {
                ...formData,
                images: imageUrls,
                price: Number(formData.price),
                status: isAdmin ? "approved" : "pending",
                userId: user.uid,
                createdAt: serverTimestamp(),
                details: {
                    ...formData.details,
                    listingId: listingId,
                },
            });

            if (isAdmin) {
                alert("İlanınız başarıyla yayınlandı!");
            } else {
                alert("İlan başvurunuz başarıyla alındı! Editörlerimiz inceledikten sonra yayınlanacaktır.");
            }
            router.push("/ilanlar");
        } catch (error) {
            console.error("Hata:", error);
            alert("İlan kaydedilirken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-32 pb-20 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-12">
                    <h1 className="text-4xl font-black text-[#333] tracking-tighter uppercase mb-4">İlan Ver</h1>
                    <p className="text-gray-400 font-medium">
                        {isAdmin
                            ? "Yeni bir ilan ekleyerek portföyünüzü genişletin. Eklediğiniz ilan anında yayına girecektir."
                            : "Hayalinizdeki alıcıyla buluşmak için formu doldurun. Başvurunuz onaylandığında yayına girecektir."}
                    </p>
                </div>

                <ListingForm onSubmit={handleSave as any} loading={loading} />
            </div>
        </div>
    );
}
