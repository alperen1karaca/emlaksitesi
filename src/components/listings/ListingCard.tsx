import { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, BedDouble, Bath, Maximize2, Sparkles, ChevronRight, Heart, Phone, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { useRouter } from "next/navigation";

interface ListingCardProps {
    id: string;
    listingNumber?: string;
    title: string;
    city?: string;
    district?: string;
    neighborhood?: string;
    location?: string; // Support for legacy/fallback
    price: string;
    rooms?: string;
    sqm?: string;
    type: "SATILIK" | "KİRALIK";
    category: "KONUT" | "OFİS" | "ARSA";
    images?: string[];
    image?: string;
    date?: string;
    agentId?: string;
}

export default function ListingCard({
    id,
    listingNumber,
    title,
    city,
    district,
    neighborhood,
    location,
    price,
    rooms,
    sqm,
    type,
    category,
    images = [],
    image,
    date,
    agentId
}: ListingCardProps) {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [isFavorited, setIsFavorited] = useState(false);
    const [agentPhone, setAgentPhone] = useState("05444356373");
    const { user } = useAuth();
    const router = useRouter();

    // Determine location display components
    let displayCity = city || "";
    let displayDistrict = district || "";
    let displayNeighborhood = neighborhood || "";

    if (!city && location) {
        // Fallback or legacy support
        const parts = location.split(/[,/]/).map(p => p.trim());
        if (parts.length >= 2) {
            displayDistrict = parts[0];
            displayCity = parts[1];
        } else {
            displayCity = location;
        }
    }

    const displayImages = images.length > 0 ? images : [image || "/logo.png"];
    const isPlaceholder = displayImages.length === 1 && displayImages[0] === "/logo.png";

    useEffect(() => {
        if (!user) {
            setIsFavorited(false);
            return;
        }

        const favRef = doc(db, "users", user.uid, "favorites", id);
        const unsubscribe = onSnapshot(favRef, (docSnap) => {
            setIsFavorited(docSnap.exists());
        });

        return () => unsubscribe();
    }, [user, id]);

    useEffect(() => {
        if (!agentId) return;

        const fetchAgent = async () => {
            try {
                const agentRef = doc(db, "agents", agentId);
                const agentSnap = await getDoc(agentRef);
                if (agentSnap.exists()) {
                    const data = agentSnap.data();
                    if (data.phone) {
                        // Strip whitespace for tel: links
                        setAgentPhone(data.phone.replace(/\s+/g, ''));
                    }
                }
            } catch (err) {
                console.error("Agent fetch error:", err);
            }
        };

        fetchAgent();
    }, [agentId]);

    useEffect(() => {
        if (displayImages.length <= 1 || isPlaceholder) return;

        const interval = setInterval(() => {
            setCurrentIdx((prev) => (prev + 1) % displayImages.length);
        }, 2000);

        return () => clearInterval(interval);
    }, [displayImages, isPlaceholder]);

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            router.push("/login");
            return;
        }

        const favRef = doc(db, "users", user.uid, "favorites", id);

        try {
            if (isFavorited) {
                await deleteDoc(favRef);
            } else {
                await setDoc(favRef, {
                    listingId: id,
                    addedAt: new Date(),
                    // Store minimal data for quick list view if needed, 
                    // though we usually fetch full listing data on favorites page
                    title,
                    price,
                    image: displayImages[0]
                });
            }
        } catch (error) {
            console.error("Favorite toggle error:", error);
        }
    };

    const handleCardClick = () => {
        router.push(`/ilanlar/${listingNumber || id}`);
    };

    return (
        <div 
            onClick={handleCardClick}
            className="block group cursor-pointer"
        >
            <div className="bg-white overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col h-full rounded-2xl border border-neutral-400 hover:border-[#E10600]">
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100 flex items-center justify-center">
                    <AnimatePresence initial={false}>
                        {displayImages[currentIdx] && (
                            <motion.img
                                key={displayImages[currentIdx]}
                                src={displayImages[currentIdx]}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1.2, ease: "easeInOut" }}
                                alt={title}
                                className={`absolute inset-0 w-full h-full group-hover:scale-110 transition-transform duration-[2000ms] ease-out ${isPlaceholder ? "object-contain p-12 opacity-20 filter grayscale" : "object-cover"
                                    }`}
                            />
                        )}
                    </AnimatePresence>
 
                    {/* Watermark Logo */}
                    {!isPlaceholder && (
                        <div className="absolute bottom-2 left-2 z-10 pointer-events-none select-none overflow-hidden rounded-lg">
                            <div className="bg-white/10 backdrop-blur-[2px] p-1.5 border border-white/10 flex items-center justify-center">
                                <img 
                                    src="/logo.png" 
                                    alt="SS Logo" 
                                    className="h-5 md:h-6 w-auto opacity-40 grayscale invert brightness-200"
                                />
                            </div>
                        </div>
                    )}

                    {/* Progress Dots */}
                    {!isPlaceholder && displayImages.length > 1 && (
                        <div className="absolute bottom-2 right-2 flex gap-1 z-20">
                            {displayImages.map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-1 h-1 rounded-full transition-all duration-300 ${i === currentIdx ? "bg-white w-3" : "bg-white/40"}`}
                                />
                            ))}
                        </div>
                    )}

                    {/* Listing ID Watermark (Top Left) */}
                    {listingNumber && !isPlaceholder && (
                        <div className="absolute top-2 left-2 z-20 pointer-events-none select-none">
                            <span className="text-[#E10600] text-[10px] md:text-[11px] font-heading font-black tracking-widest uppercase opacity-30">
                                {listingNumber}
                            </span>
                        </div>
                    )}

                    {/* Badge */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:top-[unset] md:bottom-2 md:right-2 flex flex-col gap-1 z-20 hidden">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-heading font-black uppercase tracking-widest text-white ${type === "SATILIK" ? "bg-[#E10600]" : "bg-blue-600 shadow-md"}`}>
                            {type}
                        </span>
                        <div className="bg-white/95 backdrop-blur-md px-1.5 py-0.5 rounded text-[8px] font-heading font-bold text-black tracking-widest border border-white/20 shadow-sm italic">
                            {category}
                        </div>
                    </div>

                    <button
                        onClick={toggleFavorite}
                        className={`absolute top-2 right-2 w-7 h-7 rounded-full backdrop-blur-sm flex items-center justify-center transition-all shadow-sm z-20 ${isFavorited ? "bg-[#E10600] text-white scale-110" : "bg-white/80 text-neutral-400 hover:text-[#E10600]"
                            }`}
                    >
                        <Heart size={14} fill={isFavorited ? "currentColor" : "none"} strokeWidth={isFavorited ? 0 : 2} />
                    </button>
                    {date && (
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[8px] font-bold text-white uppercase tracking-wider z-20">
                            {date}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1 bg-white">
                    <div className="mb-1 flex justify-between items-center">
                        <span className="text-base md:text-sm font-heading font-black text-[#E10600] tracking-tight">
                            {price} <span className="text-[10px] md:text-[9px] font-bold text-neutral-400">TL</span>
                        </span>
                        {category === "ARSA" && sqm && Number(sqm) > 0 && (
                            <span className="text-[10px] font-bold text-neutral-400 ml-2">
                                ({(Number(price.toString().replace(/\./g, "")) / Number(sqm.toString().replace(/\./g, ""))).toLocaleString("tr-TR", { maximumFractionDigits: 0 })} TL/m²)
                            </span>
                        )}
                    </div>

                    <h3 className="text-xs md:text-[11px] font-heading font-bold text-black mb-1.5 line-clamp-1 uppercase tracking-tight group-hover:text-[#E10600] transition-colors">
                        {title}
                    </h3>

                    <p className="text-neutral-800 text-[10px] font-sans line-clamp-2 mb-2">
                        {rooms ? `${rooms} Oda` : ""} {sqm ? ` • ${sqm} m²` : ""}
                    </p>

                    <div className="mt-auto pt-2 border-t border-neutral-100 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-neutral-400 text-[9px] md:text-[10px] font-medium uppercase tracking-tight truncate flex-1">
                            <MapPin size={10} className="shrink-0 text-[#E10600]" />
                            <div className="flex items-center gap-1 truncate">
                                {displayCity && (
                                    <Link 
                                        href={`/ilanlar?city=${displayCity}`}
                                        className="hover:text-[#E10600] transition-colors"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {displayCity}
                                    </Link>
                                )}
                                {(displayCity && displayDistrict) && <span className="text-neutral-300">/</span>}
                                {displayDistrict && (
                                    <Link 
                                        href={`/ilanlar?city=${displayCity}&district=${displayDistrict}`}
                                        className="hover:text-[#E10600] transition-colors"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {displayDistrict}
                                    </Link>
                                )}
                                {(displayDistrict && displayNeighborhood) && <span className="text-neutral-300">/</span>}
                                {displayNeighborhood && (
                                    <Link 
                                        href={`/ilanlar?city=${displayCity}&district=${displayDistrict}&neighborhood=${displayNeighborhood}`}
                                        className="hover:text-[#E10600] transition-colors"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {displayNeighborhood}
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Contact Actions */}
                        <div className="flex items-center gap-1 ml-2">
                            <a 
                                href={`tel:${agentPhone}`}
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1 px-2 py-1 bg-[#E10600]/5 text-[#E10600] rounded-lg hover:bg-[#E10600] hover:text-white transition-all group/call"
                                title="Hemen Ara"
                            >
                                <Phone size={10} className="group-hover/call:scale-110 transition-transform" />
                                <span className="text-[8px] font-black uppercase tracking-tighter hidden md:inline">ARA</span>
                            </a>
                            <a 
                                href={`https://wa.me/90${agentPhone.startsWith('0') ? agentPhone.substring(1) : agentPhone}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all group/wa"
                                title="WhatsApp"
                            >
                                <MessageCircle size={10} className="group-hover/wa:scale-110 transition-transform" />
                                <span className="text-[8px] font-black uppercase tracking-tighter hidden md:inline">WP</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
