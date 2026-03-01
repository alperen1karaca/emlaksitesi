"use client";
import { motion } from "framer-motion";
import { Info, Users, Clock, ShieldCheck } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-1/2 h-screen bg-gray-50 -z-10" />

            <div className="max-w-7xl mx-auto px-6 pt-40 pb-24">
                {/* Header Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <span className="text-primary font-bold tracking-[0.3em] uppercase text-xs mb-4 block">Hakkımızda</span>
                        <h1 className="text-5xl md:text-7xl font-black text-[#333] tracking-tighter mb-8 leading-[0.9] uppercase">
                            Güven ve <br />
                            <span className="text-primary italic">Tecrübenin</span> <br />
                            Adresi.
                        </h1>
                        <p className="text-lg text-gray-500 leading-relaxed font-medium">
                            SS EMLAK olarak Sakarya'da yıllardır gayrimenkul sektöründe öncü adımlar atıyoruz. Misyonumuz, müşterilerimize sadece bir ev değil, huzurlu bir gelecek sunmaktır.
                        </p>
                        <div className="grid grid-cols-2 gap-8 mt-12">
                            <div>
                                <span className="text-4xl font-black text-primary block mb-1">10+</span>
                                <span className="text-gray-400 text-sm uppercase tracking-widest font-bold">Yıllık Tecrübe</span>
                            </div>
                            <div>
                                <span className="text-4xl font-black text-primary block mb-1">500+</span>
                                <span className="text-gray-400 text-sm uppercase tracking-widest font-bold">Mutlu Müşteri</span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative"
                    >
                        <div className="aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white">
                            <img
                                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2073"
                                alt="Working"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {/* Aesthetic element */}
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/10 rounded-full -z-10 blur-xl" />
                    </motion.div>
                </div>

                {/* Values Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {[
                        { title: "Şeffaflık", icon: ShieldCheck, desc: "Tüm süreçlerimizde şeffaf bilgi paylaşımı ve dürüstlük ilkesiyle hareket ediyoruz." },
                        { title: "Hızlı Çözüm", icon: Clock, desc: "Müşterilerimizin zamanına değer veriyor, en hızlı şekilde sonuç odaklı çalışıyoruz." },
                        { title: "Uzman Kadro", icon: Users, desc: "Alanında uzman ve güler yüzlü ekibimizle Sakarya'nın her noktasındayız." }
                    ].map((item, i) => (
                        <div key={i} className="p-10 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-xl transition-all group">
                            <div className="w-14 h-14 bg-primary/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all">
                                <item.icon size={28} className="text-primary group-hover:text-white" />
                            </div>
                            <h3 className="text-xl font-black text-[#333] mb-4 uppercase tracking-tighter">{item.title}</h3>
                            <p className="text-gray-400 leading-relaxed text-sm">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
