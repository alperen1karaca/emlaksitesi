"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Instagram, Facebook } from "lucide-react";
import { HeroSlide } from "@/types/listing";

interface HeroSliderProps {
    slides: HeroSlide[];
}

export default function HeroSlider({ slides }: HeroSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [prevIndex, setPrevIndex] = useState(0);
    const [isReady, setIsReady] = useState<Record<number, boolean>>({});

    useEffect(() => {
        if (slides.length <= 1) return;

        // Dynamic duration based on slide data, fallback to 8s
        const currentDuration = (slides[currentIndex]?.duration || 8) * 1000;

        const timer = setTimeout(() => {
            setPrevIndex(currentIndex);
            setCurrentIndex((prev) => (prev + 1) % slides.length);
        }, currentDuration);

        return () => clearTimeout(timer);
    }, [slides, currentIndex]);

    useEffect(() => {
        setIsReady(prev => ({ ...prev, [currentIndex]: false }));
    }, [currentIndex]);

    // If no slides, we still render the container to maintain layout
    if (!slides || slides.length === 0) {
        return (
            <div className="absolute inset-0 w-full h-full overflow-hidden bg-white flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-neutral-100 border-t-[#E10600] rounded-full animate-spin" />
            </div>
        );
    }

    // Helper to parse video fragment: #t=start,end&pos=x,y
    const parseVideoFragment = (videoUrl: string) => {
        const fragment = videoUrl.split('#')[1] || "";
        let start = 0, end = 0, posX = 50, posY = 50;
        
        const tMatch = fragment.match(/t=([0-9.]+),([0-9.]+)/);
        if (tMatch) {
            start = parseFloat(tMatch[1]);
            end = parseFloat(tMatch[2]);
        }
        
        const posMatch = fragment.match(/pos=([0-9.]+),([0-9.]+)/);
        if (posMatch) {
            posX = parseFloat(posMatch[1]);
            posY = parseFloat(posMatch[2]);
        }
        
        return { start, end, posX, posY, hasFragment: !!tMatch };
    };

    // Helper to render media content to avoid duplication
    const renderMedia = (slide: HeroSlide | undefined, isCurrent: boolean) => {
        if (!slide) return null;
        
        const videoInfo = slide.videoUrl ? parseVideoFragment(slide.videoUrl) : null;
        
        return (
            <div className="absolute inset-0 w-full h-full bg-white">
                {/* Ken Burns Effect Container */}
                <motion.div 
                    animate={{ scale: [1, 1.02] }}
                    transition={{ duration: 15, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
                    className="absolute inset-0 w-full h-full"
                >
                    {/* Always render image as fallback/background if exists */}
                    {slide.imageUrl && (
                        <img
                            src={slide.imageUrl}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    )}
                    
                    {slide.videoUrl && (
                        <video
                            src={slide.videoUrl}
                            poster={slide.imageUrl || undefined}
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="auto"
                            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 z-10 bg-white ${isCurrent && !isReady[currentIndex] ? 'opacity-0' : 'opacity-100'}`}
                            style={{ 
                                objectPosition: videoInfo ? `${videoInfo.posX}% ${videoInfo.posY}%` : "center"
                            }}
                            onLoadedMetadata={(e) => {
                                const video = e.currentTarget;
                                if (videoInfo?.hasFragment) {
                                    if (Math.abs(video.currentTime - videoInfo.start) > 0.5) {
                                        video.currentTime = videoInfo.start;
                                    } else if (isCurrent) {
                                        setIsReady(prev => ({ ...prev, [currentIndex]: true }));
                                    }
                                } else if (isCurrent) {
                                    setIsReady(prev => ({ ...prev, [currentIndex]: true }));
                                }
                            }}
                            onSeeked={() => {
                                if (isCurrent) setIsReady(prev => ({ ...prev, [currentIndex]: true }));
                            }}
                            onPlay={() => {
                                if (isCurrent && !isReady[currentIndex]) {
                                    setIsReady(prev => ({ ...prev, [currentIndex]: true }));
                                }
                            }}
                            onTimeUpdate={(e) => {
                                const video = e.currentTarget;
                                if (videoInfo?.hasFragment && videoInfo.end > videoInfo.start) {
                                    if (video.currentTime >= videoInfo.end || video.currentTime < videoInfo.start - 0.5) {
                                        video.currentTime = videoInfo.start;
                                    }
                                }
                            }}
                        />
                    )}
                </motion.div>
                <div className="absolute inset-0 bg-white/10 z-20" />
            </div>
        );
    };

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden bg-white">
            {/* Balanced Crossfade: New slide fades in with a smooth 3s duration */}
            <AnimatePresence mode="popLayout">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ 
                        duration: 3.0, 
                        ease: [0.4, 0, 0.2, 1] 
                    }}
                    className="absolute inset-0 z-10 bg-white"
                >
                    {renderMedia(slides[currentIndex], true)}

                    {/* Content Layer: Staggered entrance for text */}
                    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center px-6">
                        <motion.div 
                            initial={{ opacity: 0, y: 30, filter: "blur(5px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            transition={{ delay: 0.4, duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
                            className="max-w-6xl w-full text-center space-y-4 md:space-y-8"
                        >
                            <h1 className="font-montserrat text-3xl md:text-7xl font-extrabold text-neutral-900 leading-[1.1] md:leading-tight tracking-tight uppercase">
                                {slides[currentIndex].title?.split(' ').map((word, i) => (
                                    <span key={i} className={i % 2 === 1 ? "text-[#E10600]" : "text-neutral-900"}>
                                        {word}{' '}
                                    </span>
                                )) || (
                                    <>
                                        SS <span className="text-[#E10600]">GAYRİMENKUL</span>
                                    </>
                                )}
                            </h1>

                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
                                className="flex items-center justify-center gap-4"
                            >
                                <div className="h-[2px] w-8 md:w-16 bg-[#E10600]" />
                                <p className="font-montserrat text-[11px] md:text-sm font-black text-neutral-600 uppercase tracking-[0.3em] md:tracking-[0.5em] bg-neutral-100/80 backdrop-blur-sm px-4 py-1.5 rounded-full">
                                    Premium Yatırım Danışmanlığı
                                </p>
                                <div className="h-[2px] w-8 md:w-16 bg-[#E10600]" />
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Social & Platforms Floating Bar (Bottom Left) */}
            <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ 
                    opacity: 1, 
                    x: 0,
                    y: [0, -8, 0] // Floating animation
                }}
                transition={{ 
                    opacity: { duration: 1, delay: 1 },
                    x: { duration: 1, delay: 1, ease: "easeOut" },
                    y: { 
                        duration: 4, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                    }
                }}
                className="absolute bottom-6 md:bottom-10 left-4 md:left-10 z-30 flex items-center bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/30 p-1.5 md:p-2 shadow-[0_20px_50px_rgba(0,0,0,0.3)] group/bar hover:bg-white/20 transition-colors"
            >
                <div className="flex items-center gap-1.5 md:gap-3">
                    <motion.a 
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        href="https://www.instagram.com/ss_gayrimenkul/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center text-white bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] shadow-lg hover:shadow-[#dc2743]/40 transition-all duration-300 group/insta relative"
                        title="Instagram'da Takip Et"
                    >
                        <Instagram size={24} className="md:w-7 md:h-7" />
                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[9px] font-bold px-3 py-1.5 rounded-full opacity-0 group-hover/insta:opacity-100 transition-opacity whitespace-nowrap shadow-xl border border-neutral-100">
                            Takip Et
                        </span>
                    </motion.a>

                    <motion.a 
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        href="https://www.facebook.com/SS.Emlak.Gayrimenkul/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center text-white bg-[#1877F2] shadow-lg hover:shadow-[#1877F2]/40 transition-all duration-300 group/fb relative"
                        title="Facebook"
                    >
                        <Facebook size={24} className="md:w-7 md:h-7" />
                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[9px] font-bold px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl border border-neutral-100">
                            Bize Ulaşın
                        </span>
                    </motion.a>
                    
                    {/* Divider */}
                    <div className="w-[1px] h-8 bg-white/20 mx-1 md:mx-2" />

                    <motion.a 
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        href="https://ssgayrimenkulsakarya.sahibinden.com/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center bg-[#FFD10D] shadow-lg hover:shadow-[#FFD10D]/40 transition-all duration-300 p-2 md:p-3 group/sh relative"
                        title="Sahibinden Mağazamız"
                    >
                        <img 
                            src="https://www.google.com/s2/favicons?sz=64&domain=sahibinden.com" 
                            className="w-full h-full object-contain" 
                            alt="Sahibinden" 
                        />
                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[9px] font-bold px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl border border-neutral-100">
                            İlanlarımızı Gör
                        </span>
                    </motion.a>

                    <motion.a 
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        href="https://www.emlakjet.com/emlak-ofisleri-detay/ss-gayrimenkul-1861694" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center bg-white shadow-lg hover:shadow-white/40 transition-all duration-300 p-2.5 md:p-3.5 group/ej relative"
                        title="Emlakjet"
                    >
                        <img 
                            src="https://www.google.com/s2/favicons?sz=64&domain=emlakjet.com" 
                            className="w-full h-full object-contain" 
                            alt="Emlakjet" 
                        />
                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[9px] font-bold px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl border border-neutral-100">
                            Emlakjet Portföyü
                        </span>
                    </motion.a>
                </div>
            </motion.div>
        </div>
    );
}
