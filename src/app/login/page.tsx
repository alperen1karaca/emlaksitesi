"use client";
import { useState, useEffect } from "react";
import { Mail, Lock, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                router.replace("/");
                router.refresh();
            }
        });
        return () => unsubscribe();
    }, [router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.replace("/");
            router.refresh();
        } catch (err: any) {
            console.error(err);
            if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
                setError("E-posta veya şifre hatalı.");
            } else if (err.code === "auth/invalid-email") {
                setError("Geçersiz e-posta adresi.");
            } else {
                setError("Giriş yapılamadı. Lütfen tekrar deneyin.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-white px-6 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-black text-secondary tracking-tighter uppercase mb-2">
                        Hoş <span className="text-primary italic">Geldiniz</span>
                    </h1>
                    <p className="text-secondary/40 tracking-widest text-[10px] font-black uppercase">
                        Hesabınıza giriş yapın
                    </p>
                </div>

                <div className="bg-white border border-gray-100 rounded-3xl p-8 md:p-10 shadow-xl shadow-gray-100/50">
                    <form onSubmit={handleLogin} className="space-y-5">
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3 text-red-600 text-sm font-bold"
                                >
                                    <AlertCircle size={18} />
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">E-Posta Adresi</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={20} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 rounded-2xl text-secondary outline-none focus:border-primary focus:bg-white transition-all font-bold text-sm"
                                    placeholder="ornek@mail.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Şifre</label>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        if (!email) {
                                            setError("Lütfen önce e-posta adresinizi girin.");
                                            return;
                                        }
                                        setLoading(true);
                                        try {
                                            const { sendPasswordResetEmail } = await import("firebase/auth");
                                            await sendPasswordResetEmail(auth, email);
                                            setError(""); // Clear error if any
                                            alert("Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.");
                                        } catch (err: any) {
                                            setError("Şifre sıfırlama e-postası gönderilirken bir hata oluştu.");
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                    className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline disabled:opacity-50"
                                >
                                    Şifremi Unuttum
                                </button>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={20} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 rounded-2xl text-secondary outline-none focus:border-primary focus:bg-white transition-all font-bold text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-secondary text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-primary transition-all shadow-lg shadow-secondary/10 hover:shadow-primary/20 disabled:opacity-50 group"
                        >
                            {loading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <>
                                    Giriş Yap
                                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-gray-50 text-center">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                            Hesabınız yok mu?{" "}
                            <Link href="/register" className="text-primary hover:underline ml-1">Kayıt Olun</Link>
                        </p>
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <Link href="/" className="text-secondary/30 hover:text-secondary text-[10px] font-black uppercase tracking-[0.2em] transition-colors">
                        ← Ana Sayfaya Dön
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
