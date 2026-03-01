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
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-3xl mb-6 shadow-2xl shadow-primary/20">
                        <Lock className="text-primary" size={40} />
                    </div>
                    <h1 className="text-3xl font-black text-secondary tracking-tighter uppercase mb-2">SS <span className="text-primary italic">Gayrimenkul</span></h1>
                    <p className="text-secondary/40 tracking-widest text-xs font-bold uppercase">Yönetim Paneli Girişi</p>
                </div>

                <form onSubmit={handleLogin} className="glass-card p-10 space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs py-3 px-4 rounded-xl font-bold text-center">
                            {error}
                        </div>
                    )}
                    <div>
                        <label className="block text-xs font-bold text-secondary/40 uppercase tracking-widest mb-3">E-Posta</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@ssgayrimenkul.com"
                                className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-xl text-secondary outline-none focus:border-primary transition-colors"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-secondary/40 uppercase tracking-widest mb-3">Şifre</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-xl text-secondary outline-none focus:border-primary transition-colors"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="premium-button w-full flex items-center justify-center gap-3 py-4 group disabled:opacity-50"
                    >
                        {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
                        {!loading && <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                    </button>
                </form>

                <p className="text-center mt-8 text-white/20 text-xs uppercase tracking-widest font-medium italic">
                    Kısıtlı Alan • Yetkisiz Giriş Yasaktır
                </p>
            </motion.div>
        </div>
    );
}
