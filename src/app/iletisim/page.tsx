"use client";
import { useState } from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Send, Loader2, CheckCircle2, MessageSquare, Instagram } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

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

    return (
        <div className="min-h-screen bg-[#fcfcfc]">
            {/* Hero Section */}
            <section className="bg-primary pt-32 pb-24 md:pt-40 md:pb-32 px-6 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white/20 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/20 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />
                </div>

                <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter mb-4 md:mb-6 relative z-10 px-4">Bize Ulaşın</h1>
                <p className="text-white/80 max-w-2xl mx-auto font-bold text-sm md:text-lg leading-relaxed relative z-10 px-6">
                    Hayallerinizdeki eve giden yolda size eşlik etmeye hazırız. <br className="hidden md:block" />
                    Sakarya'nın her noktasında uzman ekibimizle yanınızdayız.
                </p>
            </section>

            <div className="max-w-7xl mx-auto px-6 -mt-16 mb-24 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Info Cards */}
                    <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-min">
                        {[
                            { title: "Adres", icon: <MapPin size={28} />, text: "Doktor Nuri Bayar Cd. 54, 54100 Sakarya, Adapazarı", href: "https://www.google.com/maps/search/Doktor+Nuri+Bayar+Cd.+54,+54100+Sakarya,+Adapazarı+Türkiye" },
                            { title: "Telefon", icon: <Phone size={28} />, text: "0544 435 63 73", href: "tel:05444356373" },
                            { title: "WhatsApp", icon: <MessageSquare size={28} />, text: "0544 435 63 73", href: "https://wa.me/905444356373", color: "hover:bg-[#25D366]" },
                            { title: "E-Posta", icon: <Mail size={28} />, text: "sefabeyazitlioglu@hotmail.com", href: "mailto:sefabeyazitlioglu@hotmail.com" },
                            { title: "Instagram", icon: <Instagram size={28} />, text: "@ss_gayrimenkul", href: "https://www.instagram.com/ss_gayrimenkul/" },
                            {
                                title: "Sahibinden",
                                icon: <img src="https://www.google.com/s2/favicons?sz=64&domain=sahibinden.com" className="w-7 h-7 object-contain transition-all" />,
                                text: "Mağazamızı Ziyaret Edin",
                                href: "https://ssgayrimenkulsakarya.sahibinden.com/",
                                color: "hover:bg-[#FFD10D]"
                            }
                        ].map((item, i) => (
                            <Link
                                href={item.href}
                                key={i}
                                target={item.href.startsWith("http") ? "_blank" : undefined}
                                className="bg-white p-10 rounded-[32px] shadow-sm border border-gray-100 flex flex-col items-center text-center group hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className={`w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mb-8 ${item.color || "group-hover:bg-primary"} transition-colors`}>
                                    <div className="text-primary group-hover:text-white transition-colors">
                                        {item.icon}
                                    </div>
                                </div>
                                <h3 className="font-black text-secondary mb-4 uppercase tracking-widest text-xs">{item.title}</h3>
                                <p className="text-gray-400 font-bold text-[13px] leading-relaxed line-clamp-2">{item.text}</p>
                            </Link>
                        ))}

                    </div>

                    {/* Form Section */}
                    <div className="lg:col-span-4 self-start">
                        <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-gray-100 sticky top-32">
                            <div className="mb-10">
                                <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px] block mb-2">Hızlı İletişim</span>
                                <h3 className="text-3xl font-black text-secondary tracking-tighter uppercase leading-none">İletişim Formu</h3>
                            </div>

                            {success ? (
                                <div className="py-20 flex flex-col items-center text-center animate-in fade-in zoom-in duration-500">
                                    <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6">
                                        <CheckCircle2 size={40} />
                                    </div>
                                    <h4 className="text-xl font-black text-secondary tracking-tighter uppercase mb-2">Mesajınız Alındı</h4>
                                    <p className="text-gray-400 font-bold text-sm">En kısa sürede size geri dönüş yapacağız.</p>
                                    <button
                                        onClick={() => setSuccess(false)}
                                        className="mt-8 text-primary font-black uppercase tracking-widest text-[10px] hover:underline"
                                    >
                                        YENİ MESAJ GÖNDER
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Adınız Soyadınız</label>
                                            <input
                                                required
                                                type="text"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="Örn: Ahmet Yılmaz"
                                                className="w-full bg-gray-50 border border-gray-100 p-5 rounded-2xl text-sm text-secondary font-bold outline-none focus:border-primary transition-all placeholder:text-gray-300"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Telefon Numaranız</label>
                                            <input
                                                required
                                                type="text"
                                                value={formData.phone}
                                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder="05xx xxx xx xx"
                                                className="w-full bg-gray-50 border border-gray-100 p-5 rounded-2xl text-sm text-secondary font-bold outline-none focus:border-primary transition-all placeholder:text-gray-300"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Mesajınız</label>
                                            <textarea
                                                required
                                                rows={4}
                                                value={formData.message}
                                                onChange={e => setFormData({ ...formData, message: e.target.value })}
                                                placeholder="Size nasıl yardımcı olabiliriz?"
                                                className="w-full bg-gray-50 border border-gray-100 p-5 rounded-2xl text-sm text-secondary font-bold outline-none focus:border-primary transition-all placeholder:text-gray-300 resize-none"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-primary text-white p-6 rounded-[20px] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-primary/30 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                                        {loading ? "GÖNDERİLİYOR..." : "MESAJI GÖNDER"}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
