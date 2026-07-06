"use client";
import React from "react";
import { Camera, Search, Instagram, ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ServicesScene } from "../common/LineAnimations";

const services = [
    {
        icon: <Camera className="w-8 h-8 md:w-12 md:h-12 text-black" strokeWidth={1.5} />,
        title: "4K Drone Çekimi",
        subtitle: "FOTOĞRAF & VİDEO",
        // Sleek dark drone photo
        image: "https://images.unsplash.com/photo-1579829366248-204fe8413f31?q=80&w=2070&auto=format&fit=crop",
        description: "Mülkünüzü en iyi açılardan, havadan ve içeriden 4K kalitesinde fotoğraflıyor ve sinematik müziklerle kurgulanmış etkileyici drone videoları hazırlıyoruz.",
        features: [
            "4K yüksek çözünürlüklü drone fotoğrafları",
            "Sinematik müzik kurgulu drone videoları",
            "Mülkün çevreye ve yola konumunun gösterilmesi",
            "Işık ve renk ayarlarıyla göz alıcı sunum"
        ]
    },
    {
        icon: <Search className="w-8 h-8 md:w-12 md:h-12 text-black" strokeWidth={1.5} />,
        title: "Sahibinden Doping İlan",
        subtitle: "VİTRİN & ÖNE ÇIKARMA",
        // Clean phone showing real estate concept
        image: "https://images.unsplash.com/photo-1616423640778-28d1b53229bd?q=80&w=2070&auto=format&fit=crop",
        description: "Binlerce ilan arasında kaybolmayın. Sahibinden.com üzerinde mülkünüzü arama sonuçlarında daima zirvede tutmak için doping stratejileri uyguluyoruz.",
        features: [
            "Ana sayfa ve kategori vitrin ilanları",
            "Bölgesel aramalarda en üst sırada listelenme",
            "Kalın puntolu ve renkli özel etiketleme",
            "Düzenli görünürlük takibi ve optimizasyon"
        ]
    },
    {
        icon: <Instagram className="w-8 h-8 md:w-12 md:h-12 text-black" strokeWidth={1.5} />,
        title: "Meta Ücretli Reklam",
        subtitle: "INSTAGRAM & MARKETPLACE",
        // Sleek Instagram/Meta social media concept
        image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?q=80&w=1974&auto=format&fit=crop",
        description: "Mülkünüzü sadece emlak sitelerinde değil, potansiyel alıcıların en çok vakit geçirdiği sosyal medyada (Instagram, Facebook) hedef odaklı sponsorlu reklamlarla sunuyoruz.",
        features: [
            "Instagram Reels ve Hikaye (Story) reklamları",
            "Facebook Marketplace bölgesel öne çıkarma",
            "Yaş, bölge ve gelire göre nokta atışı hedefleme",
            "Reklam bütçesinin şeffaf ve verimli kullanımı"
        ]
    }
];

export default function ServicesSection() {
    return (
        <section className="py-12 md:py-20 bg-white overflow-hidden relative">
            <ServicesScene />
            <div className="max-w-[1200px] mx-auto px-6 relative z-10">
                
                {/* Minimal Header */}
                <div className="text-center mb-16 md:mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block text-neutral-400 text-[10px] md:text-xs font-black tracking-[0.3em] mb-4 uppercase"
                    >
                        Pazarlama Stratejimiz
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl lg:text-7xl font-black text-black uppercase tracking-tighter leading-[1]"
                    >
                        Değerinde Satış İçin <br />
                        Profesyonel Ekip
                    </motion.h2>
                </div>

                {/* Services List */}
                <div className="flex flex-col gap-20 md:gap-24">
                    {services.map((service, index) => {
                        const isEven = index % 2 === 0;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-16 md:gap-24 group`}
                            >
                                {/* Minimal Image Box */}
                                <div className="w-full md:w-[55%] relative">
                                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-black">
                                        <Image 
                                            src={service.image} 
                                            alt={service.title} 
                                            fill
                                            className="object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] opacity-90"
                                            sizes="(max-width: 768px) 100vw, 55vw"
                                        />
                                    </div>
                                    
                                    {/* User's Reference Floating Badge */}
                                    <div className={`absolute -bottom-8 ${isEven ? '-left-8 md:-left-12' : '-right-8 md:-right-12'} md:-bottom-12 w-24 h-24 md:w-36 md:h-36 bg-white rounded-[1.5rem] md:rounded-[2.5rem] flex items-center justify-center shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] z-20`}>
                                        {service.icon}
                                    </div>
                                </div>

                                {/* Minimal Text Content */}
                                <div className="w-full md:w-[45%] flex flex-col justify-center mt-10 md:mt-0">
                                    <span className="text-[#E10600] text-[10px] md:text-xs font-black tracking-[0.2em] mb-4 uppercase">
                                        {service.subtitle}
                                    </span>
                                    <h3 className="text-3xl md:text-5xl font-black text-black uppercase tracking-tighter mb-6 leading-[1.1]">
                                        {service.title}
                                    </h3>
                                    <p className="text-neutral-400 text-base md:text-lg leading-relaxed mb-8 font-medium">
                                        {service.description}
                                    </p>

                                    <div className="space-y-4 mb-10">
                                        {service.features.map((feature, idx) => (
                                            <div key={idx} className="flex items-start gap-4">
                                                <div className="mt-1 flex-shrink-0">
                                                    <Check size={16} className="text-black" />
                                                </div>
                                                <p className="text-neutral-800 font-medium leading-snug">
                                                    {feature}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <div>
                                        <Link
                                            href="/iletisim"
                                            className="inline-flex items-center gap-3 text-xs md:text-sm font-black text-black hover:text-[#E10600] uppercase tracking-widest transition-colors group/btn"
                                        >
                                            <div className="w-12 h-12 border border-[#E10600]/20 rounded-full flex items-center justify-center group-hover/btn:border-[#E10600] group-hover/btn:bg-[#E10600]/5 transition-all bg-white">
                                                <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                                            </div>
                                            Hemen İletişime Geç
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

            </div>
        </section>
    );
}
