import { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, BedDouble, Bath, Maximize2, Sparkles, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ListingCardProps {
    id: string;
    title: string;
    location: string;
    price: string;
    rooms?: string;
    sqm?: string;
    type: "SATILIK" | "KİRALIK";
    category: "KONUT" | "OFİS" | "ARSA";
    images?: string[];
    image?: string;
    date?: string;
}

export default function ListingCard({
    id,
    title,
    location,
    price,
    rooms,
    sqm,
    type,
    category,
    images = [],
    image,
    date
}: ListingCardProps) {
    const [currentIdx, setCurrentIdx] = useState(0);
    const displayImages = images.length > 0 ? images : [image || "/logo.png"];
    const isPlaceholder = displayImages.length === 1 && displayImages[0] === "/logo.png";

    useEffect(() => {
        if (displayImages.length <= 1 || isPlaceholder) return;

        const interval = setInterval(() => {
            setCurrentIdx((prev) => (prev + 1) % displayImages.length);
        }, 2000);

        return () => clearInterval(interval);
    }, [displayImages, isPlaceholder]);

    return (
        <Link href={`/ilanlar/${id}`} className="block group">
            <div className="bg-white overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col h-full rounded-2xl border border-gray-100">
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-50 flex items-center justify-center">
                    <AnimatePresence initial={false}>
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
                    </AnimatePresence>

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

                    {/* Badge */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1 z-20">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest text-white ${type === "SATILIK" ? "bg-red-600" : "bg-blue-600 shadow-lg shadow-blue-500/20"}`}>
                            {type}
                        </span>
                        <div className="bg-white/95 backdrop-blur-md px-1.5 py-0.5 rounded text-[8px] font-black text-secondary tracking-widest border border-white/20 shadow-sm italic">
                            {category}
                        </div>
                    </div>

                    <button className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors shadow-sm z-20">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                    </button>
                    {date && (
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[8px] font-bold text-white uppercase tracking-wider z-20">
                            {date}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-3 flex flex-col flex-1 bg-white">
                    <div className="mb-1 flex justify-between items-center">
                        <span className="text-base md:text-sm font-black text-secondary tracking-tight">
                            {price} <span className="text-[10px] md:text-[9px] font-bold text-gray-400">TL</span>
                        </span>
                    </div>

                    <h3 className="text-xs md:text-[11px] font-bold text-secondary/70 mb-1.5 line-clamp-1 uppercase tracking-tight group-hover:text-primary transition-colors">
                        {title}
                    </h3>

                    <div className="flex items-center gap-1.5 text-gray-500 text-[10px] md:text-[10px] font-medium uppercase tracking-tight">
                        <MapPin size={11} className="shrink-0 text-primary" />
                        <span className="truncate">{location}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
