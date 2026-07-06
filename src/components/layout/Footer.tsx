"use client";
import Link from "next/link";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, ExternalLink, MessageSquare, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function Footer() {
    const [isVisible, setIsVisible] = useState(false);
    return (
        <footer className="bg-neutral-900 text-white pt-8 md:pt-16 pb-6 md:pb-10 border-t border-white/10 text-sm leading-relaxed">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-8 gap-x-4 md:gap-10 mb-8 md:mb-12 text-sm leading-relaxed">
                <div>
                    <p className="text-neutral-400 mb-4 text-xs md:text-sm">
                        Sakarya'nın her noktasında güler yüzlü hizmet ve uzman kadromuzla yanınızdayız. Hayallerinizdeki kapıları birlikte aralıyoruz.
                    </p>
                    <div className="flex gap-4">
                        <Link href="https://www.instagram.com/ss_gayrimenkul/" target="_blank" title="Instagram" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-[#E10600] transition-all">
                            <Instagram size={18} />
                        </Link>
                        <Link href="https://www.facebook.com/SS.Emlak.Gayrimenkul/" target="_blank" title="Facebook" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-[#E10600] transition-all">
                            <Facebook size={18} />
                        </Link>
                        <Link href="https://wa.me/905444356373" target="_blank" title="WhatsApp" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-[#25D366] transition-all">
                            <MessageSquare size={18} />
                        </Link>
                        <Link href="https://ssgayrimenkulsakarya.sahibinden.com/" target="_blank" title="Sahibinden" className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-[#FFD10D] transition-all p-2 group">
                            <img src="https://www.google.com/s2/favicons?sz=64&domain=sahibinden.com" className="w-full h-full object-contain transition-all" alt="Sahibinden" />
                        </Link>
                    </div>
                </div>

                <div>
                    <h3 className="text-white font-heading font-bold mb-3 md:mb-4 uppercase tracking-widest text-[10px] md:text-xs">Hızlı Erişim</h3>
                    <ul className="flex flex-col gap-2 md:gap-3 text-neutral-400 text-xs md:text-sm">
                        <li><Link href="/" className="hover:text-[#E10600] transition-colors">Anasayfa</Link></li>
                        <li><Link href="/ilanlar" className="hover:text-[#E10600] transition-colors">Tüm İlanlar</Link></li>
                        <li><Link href="/hizmetlerimiz" className="hover:text-[#E10600] transition-colors">Hizmetlerimiz</Link></li>
                        <li><Link href="/hakkimizda" className="hover:text-[#E10600] transition-colors">Hakkımızda</Link></li>
                        <li><Link href="/iletisim" className="hover:text-[#E10600] transition-colors">İletişim</Link></li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-white font-heading font-bold mb-3 md:mb-4 uppercase tracking-widest text-[10px] md:text-xs">İletişim</h3>
                    <ul className="flex flex-col gap-3 md:gap-4 text-white/80 text-xs md:text-sm">
                        <li className="flex gap-4">
                            <MapPin className="text-[#E10600] shrink-0" size={20} />
                            <span>Doktor Nuri Bayar Cd. 54, 54100 Sakarya, Adapazarı Türkiye</span>
                        </li>
                        <li className="flex gap-4">
                            <Phone className="text-[#E10600] shrink-0" size={20} />
                            <span>0544 435 63 73</span>
                        </li>
                        <li className="flex gap-4">
                            <Mail className="text-[#E10600] shrink-0" size={20} />
                            <span>sefabeyazitlioglu@hotmail.com</span>
                        </li>
                        <li className="flex gap-3">
                            <MessageSquare className="text-[#25D366] shrink-0" size={16} />
                            <Link href="https://wa.me/905444356373" target="_blank" className="hover:text-[#E10600] transition-colors">WhatsApp Mesaj Gönder</Link>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 pt-5 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6 relative">
                <div className="flex flex-col gap-2">
                    <p className="text-neutral-400 text-sm">© 2026 SS Gayrimenkul. Tüm Hakları Saklıdır.</p>
                    <div className="flex items-center gap-2 group relative">
                        <p className="text-neutral-400 text-[10px] font-medium tracking-wider">
                            Taşınmaz Ticareti Yetki Belgesi: <span className="text-white/80">5400085</span>
                        </p>
                        <div
                            className="relative cursor-help p-1"
                            onMouseEnter={() => setIsVisible(true)}
                            onMouseLeave={() => setIsVisible(false)}
                        >
                            <Info size={12} className="text-neutral-400 group-hover:text-[#E10600] transition-colors" />
                            <AnimatePresence>
                                {isVisible && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute bottom-full left-0 mb-3 w-72 p-4 bg-white rounded-lg shadow-2xl z-50 pointer-events-none"
                                    >
                                        <div className="absolute bottom-[-6px] left-3 w-3 h-3 bg-white rotate-45" />
                                        <p className="text-neutral-800 text-[11px] leading-relaxed font-medium">
                                            5 Haziran 2018 tarihinde Resmi Gazete'de yayımlanan yürürlüğe göre taşınmazın alım, satım ve kiralama işlemine aracılık eden firmaların Taşınmaz Ticareti Yetki Belgesine sahip olması ve yine aracılık eden kişilerin Mesleki Yeterlilik Belgesi sahibi olması zorunluluğu getirildi.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap gap-4 text-neutral-400 text-xs">
                    <Link href="/yasal-bilgiler#kullanim-kosullari" className="hover:text-[#E10600] transition-colors">Kullanım Koşulları</Link>
                    <Link href="/yasal-bilgiler#kvkk" className="hover:text-[#E10600] transition-colors">KVKK Aydınlatma Metni</Link>
                    <Link href="/yasal-bilgiler#gizlilik" className="hover:text-[#E10600] transition-colors">Gizlilik Politikası</Link>
                    <Link href="/yasal-bilgiler#cerez" className="hover:text-[#E10600] transition-colors">Çerez Politikası</Link>
                    <Link href="/yasal-bilgiler#ilan" className="hover:text-[#E10600] transition-colors">İlan Yayınlama Kuralları</Link>
                    <Link href="/yasal-bilgiler#sorumluluk" className="hover:text-[#E10600] transition-colors">Sorumluluk Reddi</Link>
                </div>
            </div>
        </footer>
    );
}
