"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
    MapPin, Maximize2, BedDouble, Bath,
    MessageSquare, Heart, User,
    Printer, Share2, Facebook, Twitter,
    ChevronRight, ChevronLeft, CheckCircle2, Loader2, Phone
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Listing, Agent } from "@/types/listing";
import { useParams, useRouter } from "next/navigation";

export default function ListingDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [listing, setListing] = useState<Listing | null>(null);
    const [agent, setAgent] = useState<Agent | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [activeTab, setActiveTab] = useState("detay");

    const nextImage = () => {
        if (!listing?.images) return;
        setActiveImage((prev) => (prev + 1) % listing.images.length);
    };

    const prevImage = () => {
        if (!listing?.images) return;
        setActiveImage((prev) => (prev - 1 + listing.images.length) % listing.images.length);
    };

    useEffect(() => {
        const fetchAllData = async () => {
            if (!id) return;
            try {
                const docSnap = await getDoc(doc(db, "listings", id as string));
                if (docSnap.exists()) {
                    const listingData = { id: docSnap.id, ...docSnap.data() } as Listing;
                    setListing(listingData);

                    // Fetch agent if linked
                    if (listingData.agentId) {
                        const agentSnap = await getDoc(doc(db, "agents", listingData.agentId));
                        if (agentSnap.exists()) {
                            setAgent({ id: agentSnap.id, ...agentSnap.data() } as Agent);
                        }
                    }
                } else {
                    router.push("/ilanlar");
                }
            } catch (error) {
                console.error("Hata:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    if (!listing) return null;

    const specs = listing.category === "ARSA" ? [
        { label: "İlan No", value: id, color: "text-red-600 font-bold" },
        { label: "İlan Tarihi", value: listing.createdAt ? new Date(listing.createdAt.seconds * 1000).toLocaleDateString("tr-TR") : "-" },
        { label: "İmar Durumu", value: listing.details.propertyType || listing.details.zoningStatus || "Belirtilmemiş" },
        {
            label: "m² Fiyatı",
            value: listing.price && (listing.details.netM2 || listing.details.grossM2)
                ? Math.round(listing.price / Number((listing.details.netM2 || listing.details.grossM2).toString().replace(/\./g, "").replace(/,/g, "."))).toLocaleString("tr-TR")
                : "-"
        },
        { label: "Ada No", value: listing.details.islandNo || "-" },
        { label: "Parsel No", value: listing.details.parcelNo || "-" },
        { label: "Pafta No", value: listing.details.paftaNo || "-" },
        { label: "Gabari", value: listing.details.gabari || "-" },
        { label: "Kaks (Emsal)", value: listing.details.kaks || "-" },
        { label: "Tapu Durumu", value: listing.details.titleDeedStatus },
        { label: "Kimden", value: listing.details.from },
        { label: "Takas", value: listing.details.exchange ? "Evet" : "Hayır" }
    ] : listing.category === "OFİS" ? [
        { label: "İlan No", value: id, color: "text-red-600 font-bold" },
        { label: "İlan Tarihi", value: listing.createdAt ? new Date(listing.createdAt.seconds * 1000).toLocaleDateString("tr-TR") : "-" },
        { label: "Kategori", value: "İş Yeri" },
        { label: "Durumu", value: listing.type === "SATILIK" ? "Satılık" : "Kiralık" },
        { label: "Emlak Türü", value: listing.details.propertyType },
        { label: "m²", value: listing.details.netM2 },
        { label: "Oda Sayısı", value: listing.details.roomCount || "-" },
        { label: "Bina Yaşı", value: listing.details.buildingAge || "-" },
        { label: "Aidat (TL)", value: listing.details.dues || "-" },
        { label: "Isıtma", value: listing.details.heating || "-" },
        { label: "Bulunduğu Kat", value: listing.details.floorLevel || "-" },
        { label: "Kiracılı", value: listing.details.tenant || "-" },
        { label: "Krediye Uygunluk", value: listing.details.creditEligible ? "Evet" : "Hayır" },
        { label: "Tapu Durumu", value: listing.details.titleDeedStatus },
        { label: "Kimden", value: listing.details.from },
        { label: "Takas", value: listing.details.exchange ? "Evet" : "Hayır" },
        { label: "Durumu", value: listing.details.condition || "-" }
    ] : [
        { label: "İlan No", value: id, color: "text-red-600 font-bold" },
        { label: "İlan Tarihi", value: listing.createdAt ? new Date(listing.createdAt.seconds * 1000).toLocaleDateString("tr-TR") : "-" },
        { label: "Emlak Tipi", value: listing.details.propertyType },
        { label: "m² (Brüt)", value: listing.details.grossM2 },
        { label: "m² (Net)", value: listing.details.netM2 },
        { label: "Oda Sayısı", value: listing.details.roomCount || "-" },
        { label: "Bina Yaşı", value: listing.details.buildingAge || "-" },
        { label: "Bulunduğu Kat", value: listing.details.floorLevel || "-" },
        { label: "Kat Sayısı", value: listing.details.totalFloors || "-" },
        { label: "Isıtma", value: listing.details.heating || "-" },
        { label: "Banyo Sayısı", value: listing.details.bathroomCount || "-" },
        { label: "Mutfak", value: listing.details.kitchen || "-" },
        { label: "Balkon", value: listing.details.balcony ? "Var" : "Yok" },
        { label: "Asansör", value: listing.details.elevator ? "Var" : "Yok" },
        { label: "Otopark", value: listing.details.parking || "Yok" },
        { label: "Eşyalı", value: listing.details.furnished ? "Evet" : "Hayır" },
        { label: "Kullanım Durumu", value: listing.details.usageStatus || "-" },
        { label: "Site İçerisinde", value: listing.details.withinSite ? "Evet" : "Hayır" },
        { label: "Site Adı", value: listing.details.siteName || "-" },
        { label: "Aidat (TL)", value: listing.details.dues || "-" },
        { label: "Krediye Uygun", value: listing.details.creditEligible ? "Evet" : "Hayır" },
        { label: "Tapu Durumu", value: listing.details.titleDeedStatus },
        { label: "Kimden", value: listing.details.from },
        { label: "Takas", value: listing.details.exchange ? "Evet" : "Hayır" }
    ];

    const featureGroups = listing.category === "ARSA" ? [
        { title: "Altyapı", items: listing.features.infrastructure || [] },
        { title: "Kullanım Amacı", items: listing.features.exterior || [] },
        { title: "Manzara & Konum", items: listing.features.landscape || [] },
        { title: "Yakınlık", items: listing.features.proximity || [] },
        { title: "Muhit", items: listing.features.neighborhood || [] },
        { title: "Ulaşım", items: listing.features.transportation || [] },
    ] : [
        { title: "İç Özellikler", items: listing.features.interior },
        { title: "Dış Özellikler", items: listing.features.exterior },
        { title: "Altyapı", items: listing.features.infrastructure || [] },
        { title: "Muhit", items: listing.features.neighborhood },
        { title: "Ulaşım", items: listing.features.transportation },
        { title: "Manzara", items: listing.features.landscape || [] },
        { title: listing.category === "OFİS" ? "Ofis Tipi" : "Konut Tipi", items: listing.features.housingType || [] },
        { title: "Engelliye ve Yaşlıya Uygun", items: listing.features.disabledFriendly || [] },
    ];

    return (
        <div className="bg-[#f4f4f4] min-h-screen pt-20 md:pt-28 pb-32 md:pb-20">
            <div className="max-w-[1200px] mx-auto px-4">

                {/* Breadcrumbs & Actions */}
                <div className="flex justify-between items-center mb-4 text-[11px] text-[#039]">
                    <div className="flex items-center gap-1 font-medium">
                        <Link href="/" className="hover:text-primary transition-colors hover:underline">Anasayfa</Link> <ChevronRight size={10} />
                        <Link href="/ilanlar" className="hover:text-primary transition-colors hover:underline">Emlak</Link> <ChevronRight size={10} />
                        <span className="text-gray-400 capitalize">{listing.location.district}</span>
                    </div>
                    <div className="flex items-center gap-4 text-[#666]">
                        <button className="flex items-center gap-1 hover:text-primary transition-colors">
                            <Heart size={14} /> Favorilerime Ekle
                        </button>
                        <button className="flex items-center gap-1 hover:text-primary transition-colors" onClick={() => window.print()}>
                            <Printer size={14} /> Yazdır
                        </button>
                        <div className="flex gap-3 items-center">
                            <Link href="https://www.facebook.com/SS.Emlak.Gayrimenkul/" target="_blank" title="Facebook'ta Paylaş">
                                <Facebook size={18} className="text-blue-600 hover:scale-110 transition-transform cursor-pointer" />
                            </Link>
                            <Link
                                href={`https://wa.me/?text=${encodeURIComponent(listing.title + " - " + window.location.href)}`}
                                target="_blank"
                                title="WhatsApp ile Gönder"
                            >
                                <MessageSquare size={18} className="text-green-500 hover:scale-110 transition-transform cursor-pointer" />
                            </Link>
                            {listing.sahibindenUrl && (
                                <Link href={listing.sahibindenUrl} target="_blank">
                                    <img src="https://www.google.com/s2/favicons?sz=64&domain=sahibinden.com" className="w-4 h-4 hover:scale-110 transition-transform cursor-pointer" alt="Sahibinden" title="Sahibinden'de Görüntüle" />
                                </Link>
                            )}
                            <button
                                onClick={() => {
                                    if (navigator.share) {
                                        navigator.share({
                                            title: listing.title,
                                            text: listing.location.city + " / " + listing.location.district + " - " + listing.title,
                                            url: window.location.href
                                        });
                                    } else {
                                        navigator.clipboard.writeText(window.location.href);
                                        alert("İlan bağlantısı kopyalandı!");
                                    }
                                }}
                                className="hover:scale-110 transition-transform text-gray-400 hover:text-primary"
                                title="Bağlantıyı Paylaş"
                            >
                                <Share2 size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Hero Header */}
                <div className="bg-white border-b border-gray-200 p-6 mb-6 rounded-t-lg">
                    <h1 className="text-[19px] font-bold text-[#333] mb-2 uppercase tracking-tighter">{listing.title}</h1>
                    <div className="flex justify-between items-end">
                        <div className="flex items-center gap-2 text-[13px] text-[#039]">
                            <MapPin size={14} className="text-gray-400" />
                            {listing.location.city} / {listing.location.district} / {listing.location.neighborhood}
                        </div>
                        <div className="text-right">
                            <div className="text-[22px] font-bold text-primary">{listing.price.toLocaleString("tr-TR")} TL</div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">

                    {/* Left: Gallery */}
                    <div className="lg:col-span-8">
                        <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                            <div className="aspect-[4/3] relative overflow-hidden bg-gray-50 rounded flex items-center justify-center">
                                <img
                                    src={listing.images && listing.images.length > 0 ? listing.images[activeImage] : "/logo.png"}
                                    className={`w-full h-full ${listing.images && listing.images.length > 0 ? "object-contain" : "object-contain p-20 opacity-20 filter grayscale"
                                        }`}
                                    alt={listing.title}
                                />

                                {listing.images && listing.images.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevImage}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/20 hover:bg-white/40 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white transition-all group active:scale-95"
                                        >
                                            <ChevronLeft size={24} className="group-hover:-translate-x-0.5 transition-transform" />
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/20 hover:bg-white/40 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white transition-all group active:scale-95"
                                        >
                                            <ChevronRight size={24} className="group-hover:translate-x-0.5 transition-transform" />
                                        </button>
                                    </>
                                )}

                                {listing.images && listing.images.length > 0 && (
                                    <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                                        {activeImage + 1} / {listing.images.length} Fotoğraf
                                    </div>
                                )}
                            </div>
                            {listing.images && listing.images.length > 1 && (
                                <div className="grid grid-cols-6 gap-2 mt-2">
                                    {listing.images.map((img, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveImage(i)}
                                            className={`aspect-square rounded overflow-hidden border-2 transition-all ${activeImage === i ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"}`}
                                        >
                                            <img src={img} className="w-full h-full object-cover" alt={`Thumb ${i}`} />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Technical Table & Agent */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="grid grid-cols-2 md:grid-cols-1 divide-y divide-gray-100">
                                {specs.map((spec, i) => (
                                    <div key={i} className={`flex flex-col md:flex-row px-4 py-2 text-[12px] ${i % 2 === 0 ? "bg-gray-50/30" : "bg-white"} md:bg-white`}>
                                        <div className="w-full md:w-1/2 font-bold text-[#333] uppercase text-[9px] md:text-[10px] tracking-tight">{spec.label}</div>
                                        <div className={`w-full md:w-1/2 ${spec.color || "text-[#039] font-medium"}`}>{spec.value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-primary/5 rounded-full mb-4 overflow-hidden border border-primary/10 flex items-center justify-center font-black text-2xl text-primary">
                                {agent?.imageUrl ? <img src={agent.imageUrl} className="w-full h-full object-cover" /> : <User size={40} className="text-primary/20" />}
                            </div>
                            <img src="/logo.png" alt="SS Gayrimenkul" className="h-6 w-auto mb-2" />
                            <p className="text-[13px] font-bold text-[#333] mb-4">{agent?.name || "Sefa Beyazıtlıoğlu"}</p>

                            <div className="w-full space-y-3">
                                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded border border-gray-100">
                                    <div className="text-[11px] text-[#999] font-bold uppercase w-10 text-left">Cep</div>
                                    <div className="text-[15px] font-black text-secondary tracking-tighter">{agent?.phone || "0544 435 63 73"}</div>
                                </div>
                                <Link
                                    href={`https://wa.me/90${(agent?.phone || "05444356373").replace(/\s/g, "")}?text=${encodeURIComponent("Merhaba, " + listing.title + " ilanınızla ilgili bilgi almak istiyorum.")}`}
                                    target="_blank"
                                    className="w-full flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#039] hover:text-primary transition-colors"
                                >
                                    <MessageSquare size={16} /> Mesaj Gönder
                                </Link>
                            </div>
                        </div>

                        {listing.sahibindenUrl && (
                            <Link
                                href={listing.sahibindenUrl}
                                target="_blank"
                                className="w-full bg-[#FFD10D] hover:bg-[#ebc100] text-[#333] py-4 rounded-lg flex items-center justify-center gap-3 font-black text-[13px] uppercase tracking-tighter transition-all shadow-sm border border-[#e6bc0c]"
                            >
                                <img src="https://www.google.com/s2/favicons?sz=64&domain=sahibinden.com" className="w-6 h-6" alt="Sahibinden" />
                                <span>Sahibinden'de Görüntüle</span>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-10">
                    <div className="flex bg-[#f9f9f9] border-b border-gray-200">
                        {["detay", "konum"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-10 py-4 text-[11px] font-black uppercase tracking-widest border-r border-gray-200 transition-all ${activeTab === tab ? "bg-white text-primary border-t-2 border-t-primary -mt-[1px]" : "text-[#039] hover:bg-gray-100"}`}
                            >
                                {tab === "detay" ? "İlan Detayları" : "Konum"}
                            </button>
                        ))}
                    </div>

                    <div className="p-8">
                        <AnimatePresence mode="wait">
                            {activeTab === "detay" ? (
                                <motion.div
                                    key="detay"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-12"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                        {featureGroups.map((group, i) => (
                                            <div key={i}>
                                                <h4 className="text-[11px] font-black text-secondary uppercase mb-4 border-b border-gray-100 pb-2 tracking-widest">{group.title}</h4>
                                                <div className="space-y-2">
                                                    {group.items.length > 0 ? group.items.map((item, j) => (
                                                        <div key={j} className="flex items-center gap-2 text-[12px] text-gray-600 font-medium">
                                                            <CheckCircle2 size={14} className="text-primary" />
                                                            <span>{item}</span>
                                                        </div>
                                                    )) : <span className="text-xs text-gray-400 italic">Belirtilmemiş</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="text-[13px] text-gray-500 leading-relaxed border-t border-gray-100 pt-8">
                                        <h4 className="font-black text-secondary mb-4 uppercase tracking-widest text-xs">Açıklama</h4>
                                        <div className="whitespace-pre-wrap font-medium text-[#333]">{listing.description}</div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="konum"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="h-[500px] bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200"
                                >
                                    <div className="text-center">
                                        <MapPin size={48} className="text-primary mx-auto mb-4 opacity-20" />
                                        <p className="text-xs font-black uppercase tracking-widest text-gray-400">Harita verisi henüz eklenmedi.</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Mobile Sticky Contact Bar */}
                <div className="fixed bottom-0 left-0 right-0 z-[100] md:hidden bg-white/80 backdrop-blur-xl border-t border-gray-100 p-4 flex gap-3 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
                    <Link
                        href={`tel:${(agent?.phone || "05444356373").replace(/\s/g, "")}`}
                        className="flex-1 bg-secondary text-white py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                    >
                        <Phone size={18} />
                        Hemen Ara
                    </Link>
                    <Link
                        href={`https://wa.me/90${(agent?.phone || "05444356373").replace(/\s/g, "")}?text=${encodeURIComponent("Merhaba, " + listing.title + " ilanınızla ilgili bilgi almak istiyorum.")}`}
                        target="_blank"
                        className="flex-1 bg-[#25D366] text-white py-4 rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest shadow-lg shadow-green-500/20 active:scale-95 transition-all"
                    >
                        <MessageSquare size={18} />
                        WhatsApp
                    </Link>
                </div>
            </div>
        </div>
    );
}
