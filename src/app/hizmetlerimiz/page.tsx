"use client";
import React from "react";
import { Camera, Video, Instagram, Megaphone, CheckCircle2, Phone, MessageSquare, ArrowRight, Sparkles, ShieldCheck, Zap } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const services = [
    {
        icon: <Camera className="w-6 h-6 text-[#E10600]" />,
        title: "PRO Drone Fotoğrafçılığı",
        subtitle: "GÖKYÜZÜNDEN MİMARİ PERSPEKTİF",
        description: "Gayrimenkulünüzü sadece bir ev olarak değil, çevresi ve konumuyla bir bütün olarak sunuyoruz. 4K çözünürlüklü drone çekimlerimizle alıcılara benzersiz bir deneyim yaşatın.",
        image: "/services/drone_service.png",
        features: ["Yüksek Çözünürlüklü Ham Görüntüler", "Profesyonel Renk Düzenleme", "Geniş Açı Manzara Çekimleri"],
        accent: "bg-red-50",
        id: "drone"
    },
    {
        icon: <Video className="w-6 h-6 text-[#E10600]" />,
        title: "Sinematik Video Prodüksiyon",
        subtitle: "MÜLKÜNÜZÜN HİKAYESİNİ ANLATIN",
        description: "Sıradan videoların ötesine geçiyoruz. Profesyonel kurgu, lisanslı müzikler ve sinematik geçişlerle mülkünüzü bir sanat eserine dönüştürüyoruz.",
        image: "/services/video_service.png",
        features: ["4K HDR Sinematik Kurgu", "Müzik ve Ses Efektleri", "Sosyal Medya Formatlarına Uygun"],
        accent: "bg-neutral-50",
        id: "video"
    },
    {
        icon: <Zap className="w-6 h-6 text-[#E10600]" />,
        title: "Maksimum Görünürlük (Doping)",
        subtitle: "BİNLERCE İLAN ARASINDAN SIVRILIN",
        description: "Sahibinden.com ve yerel portallarda ilanınızın kaybolmasına izin vermiyoruz. Stratejik doping uygulamaları ile 10 kat daha fazla etkileşim sağlıyoruz.",
        image: "/services/doping_service.png",
        features: ["Anasayfa Vitrin Dopingi", "Acil Acil Kategori Vitrini", "Kalın Yazı & Renkli Çerçeve"],
        accent: "bg-yellow-50/30",
        id: "doping"
    },
    {
        icon: <Instagram className="w-6 h-6 text-[#E10600]" />,
        title: "Dijital Hedefleme & Reklam",
        subtitle: "DOĞRU ALICIYA DOĞRU MESAJ",
        description: "Instagram, Facebook ve Google üzerinden sadece ilgilenen kişilere ulaşıyoruz. Bölge, gelir düzeyi ve ilgi alanına göre optimize edilmiş profesyonel reklam yönetimi.",
        image: "/services/marketing_service.png",
        features: ["Yüksek Dönüşümlü Reklam Setleri", "Profesyonel Kreatif Tasarım", "Haftalık Performans Raporu"],
        accent: "bg-blue-50/20",
        id: "sosyal"
    }
];

export default function ServicesPage() {
    return (
        <div className="bg-white min-h-screen font-roboto overflow-x-hidden">
            {/* Minimal Hero Section */}
            <section className="relative pt-12 pb-6 md:pt-16 md:pb-8 bg-white">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col items-center text-center space-y-6">
                        
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-7xl font-black text-black uppercase tracking-tighter leading-[0.9] max-w-6xl"
                        >
                            Mülkünüzü Sadece Listelemiyoruz, <span className="text-[#E10600]">Pazarlıyoruz.</span>
                        </motion.h1>
                        
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-neutral-400 max-w-2xl mx-auto text-base md:text-xl font-medium tracking-tight"
                        >
                            Gayrimenkulünüzü değerinde ve hızlı satmak için en modern dijital teknikleri ve profesyonel ekipmanlarımızı kullanıyoruz.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex gap-4 pt-4"
                        >
                            <a href="#hizmetler" className="bg-black text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-[#E10600] transition-all shadow-2xl shadow-black/10">
                                Hizmetleri Keşfet
                            </a>
                        </motion.div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-[#E10600]/[0.02] -skew-x-12 translate-x-1/2 pointer-events-none" />
            </section>

            {/* Services Showcase */}
            <section id="hizmetler" className="py-8 md:py-12 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="space-y-16 md:space-y-20">
                        {services.map((service, index) => (
                            <motion.div
                                key={index}
                                id={service.id}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-12 md:gap-24 items-center`}
                            >
                                {/* Text Content */}
                                <div className="flex-1 space-y-8">
                                    <div className="space-y-4">
                                        <div className="w-14 h-14 bg-white border border-neutral-100 shadow-xl shadow-neutral-100 rounded-2xl flex items-center justify-center">
                                            {service.icon}
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-black text-[#E10600] uppercase tracking-[0.2em] mb-2 block">{service.subtitle}</span>
                                            <h2 className="text-3xl md:text-5xl font-black text-black uppercase tracking-tighter leading-tight">
                                                {service.title}
                                            </h2>
                                        </div>
                                    </div>
                                    
                                    <p className="text-neutral-500 text-lg leading-relaxed font-normal">
                                        {service.description}
                                    </p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {service.features.map((feature, fIndex) => (
                                            <div key={fIndex} className="flex items-center gap-3 bg-neutral-50 p-4 rounded-xl border border-neutral-100 group hover:border-[#E10600]/20 transition-all">
                                                <div className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
                                                    <CheckCircle2 size={12} className="text-[#E10600]" />
                                                </div>
                                                <span className="text-[11px] font-black text-black uppercase tracking-tight">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Image Column */}
                                <div className="flex-1 w-full relative group">
                                    <div className={`absolute inset-0 ${service.accent} rounded-[40px] rotate-2 group-hover:rotate-0 transition-transform duration-700`} />
                                    <div className="relative aspect-[4/3] rounded-[40px] overflow-hidden border border-neutral-100 shadow-2xl group-hover:-translate-y-4 group-hover:translate-x-4 transition-all duration-700">
                                        <img src={service.image} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700" alt={service.title} />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                    </div>
                                    
                                    {/* Small Detail Badge */}
                                    <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-2xl border border-neutral-100 hidden md:block animate-bounce-slow">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-[#E10600] text-white p-3 rounded-2xl">
                                                <ShieldCheck size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Profesyonel Kalite</p>
                                                <p className="text-sm font-black text-black uppercase tracking-tighter">GARANTİLİ HİZMET</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Premium Contact Section */}
            <section className="py-12 md:py-16 bg-black overflow-hidden relative">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#E10600]/20 via-transparent to-transparent" />
                
                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="space-y-12"
                    >
                        <div className="space-y-6">
                            <h2 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">
                                Mülkünüz İçin <br />
                                <span className="text-[#E10600]">Harekete Geçin.</span>
                            </h2>
                            <p className="text-neutral-400 text-lg md:text-xl font-medium max-w-2xl mx-auto italic">
                                "Sıradan bir satış değil, değer dolu bir başarı hikayesi için profesyonel ekibimiz sizi bekliyor."
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
                            <Link
                                href="tel:05444356373"
                                className="w-full sm:w-auto flex items-center justify-center gap-4 bg-white text-black px-12 py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-[#E10600] hover:text-white transition-all shadow-2xl shadow-white/5 active:scale-95"
                            >
                                <Phone size={18} />
                                MERKEZİ ARA
                            </Link>
                            <Link
                                href="https://wa.me/905444356373"
                                target="_blank"
                                className="w-full sm:w-auto flex items-center justify-center gap-4 bg-neutral-900 text-white border border-neutral-800 px-12 py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:border-[#E10600] transition-all active:scale-95"
                            >
                                <MessageSquare size={18} className="text-[#E10600]" />
                                WHATSAPP DESTEK
                            </Link>
                        </div>
                        
                        <div className="pt-12 opacity-30">
                            <img src="/logo-deneme-6.png" className="h-12 mx-auto grayscale invert" alt="Footer Logo" />
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
