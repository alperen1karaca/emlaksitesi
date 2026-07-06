"use client";
import { useState, useEffect } from "react";
import { Mail, Lock, User, ChevronRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "@/lib/firebase";
import {
    createUserWithEmailAndPassword,
    updateProfile,
    sendEmailVerification,
    onAuthStateChanged
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
    const [step, setStep] = useState(1); // 1: Form, 2: Success/Verify Email
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                router.replace("/");
            }
        });
        return () => unsubscribe();
    }, [router]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Şifreler eşleşmiyor.");
            return;
        }

        if (password.length < 6) {
            setError("Şifre en az 6 karakter olmalıdır.");
            return;
        }

        setLoading(true);
        try {
            // 1. Create Account
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            // 2. Update Profile Name
            await updateProfile(userCredential.user, {
                displayName: name
            });

            // 3. Send Verification Email
            await sendEmailVerification(userCredential.user);

            // 4. Create Firestore document
            await setDoc(doc(db, "users", userCredential.user.uid), {
                uid: userCredential.user.uid,
                email: email,
                displayName: name,
                role: "user",
                emailVerified: false,
                createdAt: serverTimestamp()
            });

            setStep(2);
        } catch (err: any) {
            console.error("Registration error:", err);
            if (err.code === "auth/email-already-in-use") {
                setError("Bu e-posta adresi zaten kullanımda.");
            } else if (err.code === "auth/invalid-email") {
                setError("Geçersiz e-posta adresi.");
            } else if (err.code === "auth/weak-password") {
                setError("Şifre çok zayıf.");
            } else {
                setError(err.message || "Kayıt sırasında bir hata oluştu.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center bg-white px-6 py-12">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-black text-secondary tracking-tighter uppercase mb-2">
                        {step === 1 ? (
                            <>Yeni <span className="text-primary italic">Hesap</span></>
                        ) : (
                            <>E-Posta <span className="text-primary italic">Doğrulama</span></>
                        )}
                    </h1>
                    <p className="text-secondary/40 tracking-widest text-[10px] font-black uppercase">
                        {step === 1 ? "SS Gayrimenkul ailesine katılın" : "Lütfen e-posta kutunuzu kontrol edin"}
                    </p>
                </div>

                <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-gray-100/30">
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.form
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onSubmit={handleRegister}
                                className="space-y-4"
                            >
                                {error && (
                                    <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3 text-red-600 text-[11px] font-black uppercase tracking-widest">
                                        <AlertCircle size={16} />
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Ad Soyad</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={18} />
                                        <input
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 rounded-2xl text-secondary outline-none focus:border-primary focus:bg-white transition-all font-bold text-sm"
                                            placeholder="Adınız Soyadınız"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">E-Posta</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={18} />
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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Şifre</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={18} />
                                            <input
                                                type="password"
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 rounded-2xl text-secondary outline-none focus:border-primary focus:bg-white transition-all font-bold text-sm"
                                                placeholder="••••••"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tekrar</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={18} />
                                            <input
                                                type="password"
                                                required
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 rounded-2xl text-secondary outline-none focus:border-primary focus:bg-white transition-all font-bold text-sm"
                                                placeholder="••••••"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-secondary transition-all shadow-xl shadow-primary/10 hover:shadow-secondary/20 disabled:opacity-50 group"
                                    >
                                        {loading ? (
                                            <Loader2 size={20} className="animate-spin" />
                                        ) : (
                                            <>
                                                Kayıt Ol
                                                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </motion.form>
                        ) : (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center py-4 space-y-6"
                            >
                                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-2 text-green-500">
                                    <CheckCircle2 size={40} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-black text-secondary uppercase tracking-tight">Doğrulama Gönderildi!</h3>
                                    <p className="text-gray-400 text-xs font-medium leading-relaxed">
                                        <span className="text-secondary font-bold">{email}</span> adresine bir doğrulama bağlantısı gönderdik. Lütfen e-postanızı kontrol edin ve hesabınızı aktifleştirin.
                                    </p>
                                </div>
                                <Link
                                    href="/login"
                                    className="inline-block bg-secondary text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-primary transition-all shadow-lg shadow-secondary/10"
                                >
                                    Giriş Sayfasına Git
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="mt-8 pt-8 border-t border-gray-50 text-center">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                            Zaten hesabınız var mı?{" "}
                            <Link href="/login" className="text-secondary hover:underline ml-1">Giriş Yapın</Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
