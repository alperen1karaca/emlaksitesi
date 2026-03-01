"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { HeroSlide } from "@/types/listing";

interface HeroSliderProps {
    slides: HeroSlide[];
}

export default function HeroSlider({ slides }: HeroSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (slides.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        }, 6000);

        return () => clearInterval(timer);
    }, [slides]);

    if (slides.length === 0) {
        return null;
    }

    return (
        <div className="relative w-full h-[600px] md:h-[800px] overflow-hidden bg-white">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute inset-0"
                >
                    <div className="absolute inset-0 bg-black/30 z-10" />
                    <img
                        src={slides[currentIndex].imageUrl}
                        alt={slides[currentIndex].title || ""}
                        className="w-full h-full object-cover"
                    />

                    {/* Content Overlay */}
                    <div className="absolute inset-0 z-20 flex items-center justify-center px-6">
                        <div className="max-w-[1400px] w-full text-center">
                            <motion.h1
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                                className="text-3xl md:text-7xl font-black text-white uppercase tracking-tighter mb-4 md:mb-6 drop-shadow-2xl px-4"
                            >
                                {slides[currentIndex].title || "SS Gayrimenkul"}
                            </motion.h1>
                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.7, duration: 0.8 }}
                                className="text-sm md:text-xl text-white/90 font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] drop-shadow-lg px-4"
                            >
                                {slides[currentIndex].subtitle || "Lüks Konut ve Yatırım Danışmanlığı"}
                            </motion.p>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Slider Dots */}
            {slides.length > 1 && (
                <div className="absolute bottom-48 md:bottom-40 left-1/2 -translate-x-1/2 z-30 flex gap-3">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentIndex(i)}
                            className={`h-1 rounded-full transition-all duration-500 ${i === currentIndex ? "w-12 bg-white" : "w-4 bg-white/40"
                                }`}
                        />
                    ))}
                </div>
            )}

            {/* Bottom Gradient for smooth transition to content */}
            <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-white to-transparent z-20" />
        </div>
    );
}
