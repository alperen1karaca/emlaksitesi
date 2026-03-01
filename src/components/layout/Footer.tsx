"use client";
import Link from "next/link";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, ExternalLink, MessageSquare, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function Footer() {
    const [isVisible, setIsVisible] = useState(false);
    return (
        <footer className="bg-secondary text-white pt-24 pb-12 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20 text-sm">
                <div>
                    <p className="text-white/50 leading-relaxed mb-8">
                        Sakarya'nın her noktasında güler yüzlü hizmet ve uzman kadromuzla yanınızdayız. Hayallerinizdeki kapıları birlikte aralıyoruz.
                    </p>
                    <div className="flex gap-4">
                        <Link href="https://www.instagram.com/ss_gayrimenkul/" target="_blank" title="Instagram" className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-primary transition-all">
                            <Instagram size={18} />
                        </Link>
                        <Link href="https://www.facebook.com/SS.Emlak.Gayrimenkul/" target="_blank" title="Facebook" className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-primary transition-all">
                            <Facebook size={18} />
                        </Link>
                        <Link href="https://wa.me/905444356373" target="_blank" title="WhatsApp" className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-[#25D366] transition-all">
                            <MessageSquare size={18} />
                        </Link>
                        <Link href="https://ssgayrimenkulsakarya.sahibinden.com/" target="_blank" title="Sahibinden" className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-[#FFD10D] transition-all p-2 group">
                            <img src="https://www.google.com/s2/favicons?sz=64&domain=sahibinden.com" className="w-full h-full object-contain transition-all" alt="Sahibinden" />
                        </Link>
                    </div>
                </div>

                <div>
                    <h3 className="text-white font-bold mb-8 uppercase tracking-widest text-sm">Hızlı Erişim</h3>
                    <ul className="flex flex-col gap-4 text-white/50">
                        <li><Link href="/" className="hover:text-primary transition-colors">Anasayfa</Link></li>
                        <li><Link href="/ilanlar" className="hover:text-primary transition-colors">Tüm İlanlar</Link></li>
                        <li><Link href="/hakkimizda" className="hover:text-primary transition-colors">Hakkımızda</Link></li>
                        <li><Link href="/iletisim" className="hover:text-primary transition-colors">İletişim</Link></li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-white font-bold mb-8 uppercase tracking-widest text-sm">Çalıştığımız Bölgeler</h3>
                    <ul className="flex flex-col gap-4 text-white/50">
                        <li>Serdivan, Sakarya</li>
                        <li>Adapazarı, Sakarya</li>
                        <li>Erenler, Sakarya</li>
                        <li>Sapanca, Sakarya</li>
                        <li>Karasu, Sakarya</li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-white font-bold mb-8 uppercase tracking-widest text-sm">İletişim</h3>
                    <ul className="flex flex-col gap-6 text-white/60">
                        <li className="flex gap-4">
                            <MapPin className="text-primary shrink-0" size={20} />
                            <span>Doktor Nuri Bayar Cd. 54, 54100 Sakarya, Adapazarı Türkiye</span>
                        </li>
                        <li className="flex gap-4">
                            <Phone className="text-primary shrink-0" size={20} />
                            <span>0544 435 63 73</span>
                        </li>
                        <li className="flex gap-4">
                            <Mail className="text-primary shrink-0" size={20} />
                            <span>sefabeyazitlioglu@hotmail.com</span>
                        </li>
                        <li className="flex gap-4">
                            <MessageSquare className="text-green-500 shrink-0" size={20} />
                            <Link href="https://wa.me/905444356373" target="_blank" className="hover:text-primary transition-colors">WhatsApp Mesaj Gönder</Link>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 relative">
                <div className="flex flex-col gap-2">
                    <p className="text-white/30 text-sm">© 2026 SS Gayrimenkul. Tüm Hakları Saklıdır.</p>
                    <div className="flex items-center gap-2 group relative">
                        <p className="text-white/40 text-[10px] font-medium tracking-wider">
                            Taşınmaz Ticareti Yetki Belgesi: <span className="text-white/60">5400085</span>
                        </p>
                        <div
                            className="relative cursor-help p-1"
                            onMouseEnter={() => setIsVisible(true)}
                            onMouseLeave={() => setIsVisible(false)}
                        >
                            <Info size={12} className="text-white/30 group-hover:text-primary transition-colors" />
                            <AnimatePresence>
                                {isVisible && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute bottom-full left-0 mb-3 w-72 p-4 bg-white rounded-lg shadow-2xl z-50 pointer-events-none"
                                    >
                                        <div className="absolute bottom-[-6px] left-3 w-3 h-3 bg-white rotate-45" />
                                        <p className="text-secondary text-[11px] leading-relaxed font-medium">
                                            5 Haziran 2018 tarihinde Resmi Gazete'de yayımlanan yürürlüğe göre taşınmazın alım, satım ve kiralama işlemine aracılık eden firmaların Taşınmaz Ticareti Yetki Belgesine sahip olması ve yine aracılık eden kişilerin Mesleki Yeterlilik Belgesi sahibi olması zorunluluğu getirildi.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
                <div className="flex gap-8 text-white/30 text-xs">
                    <Link href="#" className="hover:text-primary transition-colors">Kullanım Koşulları</Link>
                    <Link href="#" className="hover:text-primary transition-colors">KVKK Aydınlatma Metni</Link>
                </div>
            </div>
        </footer>
    );
}
