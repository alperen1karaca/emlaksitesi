"use client";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle } from "lucide-react";

export default function FloatingWhatsApp() {
    // Change to your actual WhatsApp Number
    const whastappUrl = "https://wa.me/905444356373";

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
                className="fixed bottom-6 right-5 md:right-8 z-[1000]"
            >
                <Link
                    href={whastappUrl}
                    target="_blank"
                    className="group relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-[#25D366] text-white rounded-full shadow-lg shadow-[#25D366]/40 hover:scale-110 hover:bg-[#1ebd5a] transition-all duration-300"
                >
                    {/* Tooltip Always Visible (Above Button) */}
                    <div className="absolute bottom-[110%] md:bottom-[120%] right-[-10px] md:right-0 bg-white border border-neutral-400/20 text-black text-[10px] md:text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-2xl transition-all whitespace-nowrap shadow-xl antialiased">
                        <span className="block group-hover:hidden">Anında İletişim</span>
                        <span className="hidden group-hover:block text-[#E10600]">Bize Ulaşın</span>
                        {/* Triangle Pointing Down */}
                        <div className="absolute -bottom-2 right-[25px] md:right-8 border-x-8 border-x-transparent border-t-8 border-t-white" />
                    </div>
                    
                    <MessageCircle size={28} className="md:w-8 md:h-8" />
                    
                    {/* Ping Animation Effect behind the icon */}
                    <div className="absolute inset-0 w-full h-full rounded-full border border-[#25D366] opacity-0 group-hover:animate-ping pointer-events-none" />
                </Link>
            </motion.div>
        </AnimatePresence>
    );
}
