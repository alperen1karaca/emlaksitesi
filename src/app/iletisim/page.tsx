"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Send, Loader2, CheckCircle2, MessageSquare, Instagram, Globe, Clock, ShieldCheck } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { ContactUltra } from "@/components/common/LineAnimations";

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        message: ""
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addDoc(collection(db, "contact_messages"), {
                ...formData,
                createdAt: serverTimestamp(),
                status: "NEW"
            });
            setSuccess(true);
            setFormData({ name: "", phone: "", message: "" });
            setTimeout(() => setSuccess(false), 5000);
        } catch (error) {
            console.error("Hata:", error);
            alert("Mesajınız gönderilirken bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { duration: 0.7 } }
    };

    return (
        <div className="min-h-screen bg-white selection:bg-[#E10600]/10">
            {/* ULTRA PREMIUM HERO SECTION - LIGHT THEME */}
            <section className="bg-neutral-50 pt-32 pb-40 md:pt-48 md:pb-64 px-6 text-center text-black relative overflow-hidden">
                <ContactUltra className="opacity-15" />
                
                {/* Technical Metadata Decoration */}
                <div className="absolute top-32 left-10 hidden xl:flex flex-col gap-4 text-[9px] font-mono uppercase tracking-[0.4em] text-black/10 select-none">
                    <div className="flex items-center gap-2">
                        <Globe size={10} /> 40.7627° N, 30.3948° E
                    </div>
                    <div>EST. 2004 / SAKARYA</div>
                    <div className="h-[1px] w-20 bg-black/5" />
                </div>

                <div className="absolute bottom-32 right-10 hidden xl:flex flex-col items-end gap-4 text-[9px] font-mono uppercase tracking-[0.4em] text-black/10 select-none text-right">
                    <div className="flex items-center gap-2">
                        SECURED <ShieldCheck size={10} className="text-[#E10600]" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock size={10} /> 7/24 ACTIVE SUPPORT
                    </div>
                </div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="relative z-10 max-w-5xl mx-auto"
                >
                    <span className="text-[#E10600] text-[10px] md:text-xs font-heading font-black uppercase tracking-[0.6em] mb-8 block opacity-80 animate-pulse">
                        Luxury Investment & Advisory
                    </span>
                    <h1 className="text-6xl md:text-[10rem] font-heading font-black uppercase tracking-[-0.04em] leading-[0.8] mb-12">
                        BİZE <br /> <span className="text-[#E10600] italic">ULAŞIN</span>
                    </h1>
                    <div className="h-1 w-24 bg-[#E10600] mx-auto mb-10" />
                    <p className="text-black/40 max-w-2xl mx-auto font-medium text-lg md:text-xl leading-relaxed px-6 tracking-tight">
                        Seçkin portföyümüz ve uzman danışman kadromuzla gayrimenkul yolculuğunuzda en prestijli adımı birlikte atalım.
                    </p>
                </motion.div>
            </section>

            <div className="max-w-[1400px] mx-auto px-6 -mt-32 md:-mt-48 mb-32 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* LEFT PANEL: LUXURY INFO CARDS */}
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                        {[
                            { title: "Genel Merkez", icon: <MapPin size={24} />, text: "Doktor Nuri Bayar Cd. 54, 54100 Sakarya, Adapazarı", href: "https://www.google.com/maps/search/Doktor+Nuri+Bayar+Cd.+54,+54100+Sakarya,+Adapazarı+Türkiye", desc: "Sakarya'nın kalbinde sizi bekliyoruz." },
                            { title: "VIP İletişim", icon: <Phone size={24} />, text: "0544 435 63 73", href: "tel:05444356373", desc: "Hızlı ve profesyonel görüşme hattı." },
                            { title: "Anlık Destek", icon: <MessageSquare size={24} />, text: "WhatsApp Hattı", href: "https://wa.me/905444356373", color: "text-[#25D366]", desc: "Dilediğiniz an mesaj yoluyla ulaşın." },
                            { title: "E-Yazışma", icon: <Mail size={24} />, text: "sefabeyazitlioglu@hotmail.com", href: "mailto:sefabeyazitlioglu@hotmail.com", desc: "Teklif ve detaylar için mail gönderin." },
                            { title: "Dijital Vitrin", icon: <Instagram size={24} />, text: "@ss_gayrimenkul", href: "https://www.instagram.com/ss_gayrimenkul/", desc: "En yeni portföyü sosyal medyada keşfedin." },
                            {
                                title: "Emlak Portalı",
                                icon: <img src="https://www.google.com/s2/favicons?sz=64&domain=sahibinden.com" className="w-6 h-6 grayscale group-hover:grayscale-0 transition-all" />,
                                text: "Sahibinden Mağazası",
                                href: "https://ssgayrimenkulsakarya.sahibinden.com/",
                                desc: "İlanlarımızı detaylı filtreleyerek inceleyin."
                            }
                        ].map((item, i) => (
                            <motion.div variants={itemVariants} key={i}>
                                <Link
                                    href={item.href}
                                    target={item.href.startsWith("http") ? "_blank" : undefined}
                                    className="block h-full bg-white/80 backdrop-blur-xl p-8 rounded-[40px] border border-neutral-100 hover:border-[#E10600]/30 hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)] transition-all duration-700 group relative overflow-hidden"
                                >
                                    {/* Subtle Gradient Hover */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#E10600]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    
                                    <div className="relative z-10">
                                        <div className={`w-12 h-12 rounded-2xl bg-neutral-50 flex items-center justify-center mb-6 transition-all duration-500 group-hover:bg-black group-hover:text-white group-hover:scale-110 shadow-sm`}>
                                            <div className={`${item.color || "text-[#E10600]"}`}>
                                                {item.icon}
                                            </div>
                                        </div>
                                        <h3 className="font-heading font-black text-black uppercase tracking-[0.2em] text-[10px] mb-2">{item.title}</h3>
                                        <div className="text-black font-bold text-base mb-2 group-hover:text-[#E10600] transition-colors">{item.text}</div>
                                        <p className="text-neutral-400 font-medium text-[11px] leading-relaxed">{item.desc}</p>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* RIGHT PANEL: ELITE INQUIRY FORM - LIGHT THEME */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, x: 50 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="lg:col-span-5"
                    >
                        <div className="bg-white text-black p-12 md:p-16 rounded-[60px] shadow-[0_50px_100px_rgba(0,0,0,0.05)] border border-neutral-100 relative overflow-hidden group">
                            {/* Form Inner Glow */}
                            <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#E10600]/5 rounded-full blur-[100px] pointer-events-none" />
                            
                            <div className="relative z-10">
                                <div className="mb-14">
                                    <span className="text-[#E10600] font-heading font-black uppercase tracking-[0.4em] text-[10px] block mb-4">Investment Inquiry</span>
                                    <h3 className="text-5xl font-heading font-black text-black tracking-tight uppercase leading-none">İletişime <br /> Geçin</h3>
                                </div>

                                <AnimatePresence mode="wait">
                                    {success ? (
                                        <motion.div 
                                            key="success"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            className="py-16 flex flex-col items-center text-center"
                                        >
                                            <div className="w-24 h-24 bg-[#E10600]/10 text-[#E10600] rounded-full flex items-center justify-center mb-8 shadow-[0_10px_30px_rgba(225,6,0,0.2)]">
                                                <CheckCircle2 size={48} />
                                            </div>
                                            <h4 className="text-3xl font-heading font-black text-black dark:text-black tracking-tight uppercase mb-4">Mesajınız Alındı</h4>
                                            <p className="text-black/40 font-medium text-base mb-10 max-w-[280px]">Değerli talebiniz sisteme başarıyla kaydedildi. En kısa sürede iletişime geçeceğiz.</p>
                                            <button
                                                onClick={() => setSuccess(false)}
                                                className="px-10 py-4 border border-black/10 rounded-full text-black font-heading font-bold uppercase tracking-widest text-[10px] hover:bg-black hover:text-white transition-all"
                                            >
                                                YENİ TALEP OLUŞTUR
                                            </button>
                                        </motion.div>
                                    ) : (
                                        <form onSubmit={handleSubmit} className="space-y-10 group/form">
                                            <div className="space-y-8">
                                                <div className="group/field">
                                                    <label className="text-[9px] font-heading font-black text-black/30 uppercase tracking-[0.4em] mb-4 block ml-2 group-hover/field:text-[#E10600] transition-colors">AD SOYAD</label>
                                                    <input
                                                        required
                                                        type="text"
                                                        value={formData.name}
                                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                        placeholder="Ahmet Yılmaz"
                                                        className="w-full bg-neutral-50 border border-neutral-100 p-6 rounded-[24px] text-sm text-black font-bold outline-none focus:border-[#E10600] focus:bg-white transition-all placeholder:text-neutral-200"
                                                    />
                                                </div>
                                                <div className="group/field">
                                                    <label className="text-[9px] font-heading font-black text-black/30 uppercase tracking-[0.4em] mb-4 block ml-2 group-hover/field:text-[#E10600] transition-colors">GSM / İLETİŞİM</label>
                                                    <input
                                                        required
                                                        type="text"
                                                        value={formData.phone}
                                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                        placeholder="+90 (__) ___ __ __"
                                                        className="w-full bg-neutral-50 border border-neutral-100 p-6 rounded-[24px] text-sm text-black font-bold outline-none focus:border-[#E10600] focus:bg-white transition-all placeholder:text-neutral-200"
                                                    />
                                                </div>
                                                <div className="group/field">
                                                    <label className="text-[9px] font-heading font-black text-black/30 uppercase tracking-[0.4em] mb-4 block ml-2 group-hover/field:text-[#E10600] transition-colors">TALEBİNİZ</label>
                                                    <textarea
                                                        required
                                                        rows={4}
                                                        value={formData.message}
                                                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                                                        placeholder="Size nasıl yardımcı olabiliriz?"
                                                        className="w-full bg-neutral-50 border border-neutral-100 p-6 rounded-[24px] text-sm text-black font-bold outline-none focus:border-[#E10600] focus:bg-white transition-all placeholder:text-neutral-200 resize-none"
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full bg-[#E10600] text-white p-7 rounded-[30px] font-heading font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-[#E10600]/30 flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                            >
                                                {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                                                {loading ? "GÖNDERİLİYOR..." : "TALEP OLUŞTUR"}
                                            </button>
                                        </form>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* BRANDING FOOTER AREA */}
            <section className="py-32 bg-neutral-50 px-6 border-t border-neutral-100 overflow-hidden relative">
                 <div className="max-w-7xl mx-auto text-center relative z-10">
                    <span className="text-[#E10600] font-heading font-black text-[10px] uppercase tracking-[0.5em] mb-6 block">Legacy of Trust</span>
                    <h2 className="text-4xl md:text-8xl font-heading font-black uppercase tracking-[-0.04em] text-black/5 leading-none">
                        Sakarya'nın Köklü Mirası
                    </h2>
                 </div>
                 {/* Subtle BG Shapes */}
                 <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                    <div className="absolute -top-[50%] -left-[10%] w-[60%] h-[120%] bg-gradient-to-r from-[#E10600] to-transparent rotate-12" />
                 </div>
            </section>
        </div>
    );
}
