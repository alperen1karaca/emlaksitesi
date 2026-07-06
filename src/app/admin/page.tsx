"use client";
import { useState, useEffect } from "react";
import { Lock, Mail, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                router.push("/admin/dashboard");
            }
        });
        return () => unsubscribeAuth();
    }, [router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/admin/dashboard");
        } catch (err: any) {
            setError("Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white px-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-[#E10600]/10 rounded-3xl mb-6 shadow-2xl shadow-[#E10600]/20">
                        <Lock className="text-[#E10600]" size={40} />
                    </div>
                    <h1 className="text-3xl font-black text-black tracking-tighter uppercase mb-2">SS <span className="text-[#E10600] italic font-playfair font-normal lowercase tracking-normal">Gayrimenkul</span></h1>
                    <p className="text-neutral-400 tracking-widest text-xs font-bold uppercase">Yönetim Paneli Girişi</p>
                </div>

                <div className="bg-white border border-neutral-400/30 rounded-xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 p-10 space-y-6">
                    <p className="text-center text-neutral-400 text-sm font-medium">
                        Sistem şu an erişime açıktır. Şifre girmeden devam edebilirsiniz.
                    </p>
                    <button
                        onClick={() => router.push("/admin/dashboard")}
                        className="w-full flex items-center justify-center gap-3 py-4 group px-6 bg-[#E10600] text-white font-heading font-bold rounded-lg hover:bg-[#C00500] transition-all duration-300 shadow-sm active:scale-95"
                    >
                        Yönetim Paneline Giriş Yap
                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                <p className="text-center mt-8 text-white/20 text-xs uppercase tracking-widest font-medium italic">
                    Kısıtlı Alan • Yetkisiz Giriş Yasaktır
                </p>
            </motion.div>
        </div>
    );
}
