"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Home, TrendingUp, Handshake } from "lucide-react";
import { ContactScene } from "../common/LineAnimations";

export default function PromotionalBanner() {
    return (
        <section className="py-12 md:py-20 px-6 bg-gradient-to-b from-white to-[#F5F5F5] border-t border-neutral-400/10 overflow-hidden relative">
            <ContactScene />
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#E10600]/5 to-transparent skew-x-12 opacity-50 pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-[#E10600]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-[1200px] mx-auto relative z-10">
                <div className="text-center mb-12 md:mb-16">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="inline-block bg-[#E10600]/10 text-[#E10600] px-4 py-1.5 rounded-full text-[10px] md:text-sm font-black tracking-[0.2em] mb-4 md:mb-6 uppercase border border-[#E10600]/20"
                    >
                        Sizinle Büyüyoruz
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-3xl md:text-5xl lg:text-6xl font-heading font-black text-black tracking-tighter uppercase leading-[1.1] mb-6"
                    >
                        Mülkünüz Bizimle <br className="hidden md:block" />
                        <span className="text-[#E10600]">Gerçek Değerini</span> Bulsun
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-sm md:text-lg text-neutral-400 font-medium max-w-2xl mx-auto leading-relaxed"
                    >
                        İster satmak ister kiralamak isteyin, uzman ekibimizle sürecin her adımında yanınızdayız. Profesyonel pazarlama, doğru fiyatlandırma ve hızlı sonuç.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 mb-16">
                    {/* Feature 1 */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-white p-8 md:p-10 rounded-3xl shadow-lg shadow-black/[0.03] border border-neutral-400/10 hover:border-[#E10600]/30 transition-all hover:-translate-y-2 group"
                    >
                        <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#E10600]/10 group-hover:text-[#E10600] transition-colors">
                            <Home size={32} className="text-neutral-800 group-hover:text-[#E10600] transition-colors" />
                        </div>
                        <h3 className="text-xl font-heading font-black text-black mb-3 uppercase tracking-tight">Hızlı Listeleme</h3>
                        <p className="text-sm text-neutral-400 font-medium leading-relaxed mb-6">Mülkünüzü saniyeler içinde binlerce potansiyel alıcıyla buluşturun. Geniş ağımız ile hızlı sonuçlar alın.</p>
                        <Link href="/iletisim" className="text-[11px] font-black text-[#E10600] tracking-widest flex items-center gap-2 group/link uppercase">
                            Hemen İletişime Geç <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>

                    {/* Feature 2 */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="bg-white p-8 md:p-10 rounded-3xl shadow-lg shadow-black/[0.03] border border-neutral-400/10 hover:border-[#E10600]/30 transition-all hover:-translate-y-2 group"
                    >
                        <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#E10600]/10 group-hover:text-[#E10600] transition-colors">
                            <TrendingUp size={32} className="text-neutral-800 group-hover:text-[#E10600] transition-colors" />
                        </div>
                        <h3 className="text-xl font-heading font-black text-black mb-3 uppercase tracking-tight">Doğru Fiyatlandırma</h3>
                        <p className="text-sm text-neutral-400 font-medium leading-relaxed mb-6">Pazar analizi ve ekspertiz desteğiyle mülkünüzün tam değerini tespit ediyor, kârınızı maksimize ediyoruz.</p>
                        <Link href="/iletisim" className="text-[11px] font-black text-[#E10600] tracking-widest flex items-center gap-2 group/link uppercase">
                            Ekspertiz Talebi <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>

                    {/* Feature 3 */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="bg-white p-8 md:p-10 rounded-3xl shadow-lg shadow-black/[0.03] border border-neutral-400/10 hover:border-[#E10600]/30 transition-all hover:-translate-y-2 group"
                    >
                        <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#E10600]/10 group-hover:text-[#E10600] transition-colors">
                            <Handshake size={32} className="text-neutral-800 group-hover:text-[#E10600] transition-colors" />
                        </div>
                        <h3 className="text-xl font-heading font-black text-black mb-3 uppercase tracking-tight">Güvenilir Danışmanlık</h3>
                        <p className="text-sm text-neutral-400 font-medium leading-relaxed mb-6">Hukuki süreçlerden tapu işlemlerine kadar her aşamada şeffaf ve profesyonel destek sağlıyoruz.</p>
                        <Link href="/iletisim" className="text-[11px] font-black text-[#E10600] tracking-widest flex items-center gap-2 group/link uppercase">
                            Danışmanımızla Görüş <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                </div>

                {/* Big CTA Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.5 }}
                >
                    <div className="bg-[#2B2B2B] rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 relative overflow-hidden shadow-2xl">
                        {/* Decorative BG element */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle,rgba(225,6,0,0.15)_0%,transparent_60%)] pointer-events-none" />

                        <div className="md:w-2/3 relative z-10 text-center md:text-left">
                            <h3 className="text-2xl md:text-4xl font-heading font-black text-white tracking-tighter uppercase leading-tight mb-4">
                                İlanınızı Bize Bırakın, <br />
                                <span className="text-[#E10600]">Arkanıza Yaslanın</span>
                            </h3>
                            <p className="text-neutral-100/80 text-sm md:text-base font-medium max-w-xl">
                                Profesyonel fotoğraf/video çekimi, öncelikli sergileme ve hedef kitle odaklı reklam çalışmalarıyla mülkünüzü en iyi şekilde pazarlıyoruz.
                            </p>
                        </div>
                        
                        <div className="md:w-1/3 relative z-10 flex justify-center md:justify-end w-full">
                            <Link
                                href="https://wa.me/905444356373"
                                target="_blank"
                                className="w-full md:w-auto bg-[#E10600] text-white px-8 py-5 md:px-12 md:py-6 rounded-full font-heading font-black uppercase tracking-widest text-xs md:text-sm hover:bg-white hover:text-[#E10600] hover:scale-105 transition-all text-center flex items-center justify-center gap-3 shadow-xl shadow-[#E10600]/30"
                            >
                                WhatsApp'tan Yazın <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
