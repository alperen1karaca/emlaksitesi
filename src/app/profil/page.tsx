"use client";
import { UserCircle, Lock, ChevronRight, Loader2, AlertCircle, CheckCircle2, ShieldCheck, Phone, Mail, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "@/lib/firebase";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ProfilePage() {
    const { user, loading: authLoading } = useAuth();
    const [email, setEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (user?.email) {
            setEmail(user.email);
        }
    }, [user]);

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    if (!user) {
        router.push("/login?redirect=/profil");
        return null;
    }

    const handleUpdateEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (email === user.email) {
            setError("Yeni e-posta adresi eskisinden farklı olmalıdır.");
            return;
        }

        setLoading(true);
        try {
            const { updateEmail, sendEmailVerification } = await import("firebase/auth");

            // Re-authenticate user
            const credential = EmailAuthProvider.credential(user.email!, currentPassword);
            await reauthenticateWithCredential(user, credential);

            // Update email
            await updateEmail(user, email);

            // Send verification to new email
            await sendEmailVerification(user);

            // Update Firestore
            await updateDoc(doc(db, "users", user.uid), {
                email: email,
                emailVerified: false
            });

            setSuccess("E-posta adresiniz güncellendi. Lütfen yeni adresinize gönderilen doğrulama linkine tıklayın.");
            setCurrentPassword("");
        } catch (err: any) {
            console.error(err);
            if (err.code === "auth/wrong-password") {
                setError("Mevcut şifreniz hatalı.");
            } else if (err.code === "auth/email-already-in-use") {
                setError("Bu e-posta adresi zaten kullanımda.");
            } else if (err.code === "auth/requires-recent-login") {
                setError("Güvenlik nedeniyle bu işlem için tekrar giriş yapmanız gerekiyor.");
            } else {
                setError("E-posta güncellenirken bir hata oluştu.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (newPassword !== confirmPassword) {
            setError("Yeni şifreler eşleşmiyor.");
            return;
        }

        if (newPassword.length < 6) {
            setError("Şifre en az 6 karakter olmalıdır.");
            return;
        }

        setLoading(true);
        try {
            // Re-authenticate user
            const credential = EmailAuthProvider.credential(user.email!, currentPassword);
            await reauthenticateWithCredential(user, credential);

            // Update password
            await updatePassword(user, newPassword);

            setSuccess("Şifreniz başarıyla güncellendi.");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            console.error(err);
            if (err.code === "auth/wrong-password") {
                setError("Mevcut şifreniz hatalı.");
            } else if (err.code === "auth/too-many-requests") {
                setError("Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin.");
            } else {
                setError("Şifre güncellenirken bir hata oluştu.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white pt-32 pb-20 px-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-secondary tracking-tighter uppercase mb-2">Hesabım</h1>
                        <p className="text-gray-400 font-medium">SS Gayrimenkul Profil Yönetimi</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* User Info Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-50 border border-gray-100 rounded-3xl p-8 shadow-sm">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                                    <UserCircle size={64} />
                                </div>
                                <h2 className="text-xl font-black text-secondary uppercase tracking-tight mb-1">
                                    {user.displayName || "Kullanıcı"}
                                </h2>
                                <p className="text-sm font-bold text-gray-400 mb-6">{user.email}</p>

                                <div className="w-full pt-6 border-t border-gray-100 flex flex-col gap-3">
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        <span>Hesap Durumu</span>
                                        <span className={`flex items-center gap-1 ${user.emailVerified ? "text-green-500" : "text-amber-500"}`}>
                                            <ShieldCheck size={12} /> {user.emailVerified ? "Doğrulanmış" : "Onay Bekliyor"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Account Settings Forms */}
                    <div className="lg:col-span-2 space-y-10">
                        {/* Profile Info Form */}
                        <div className="bg-white border border-gray-100 rounded-3xl p-8 md:p-10 shadow-xl shadow-gray-100/50">
                            <h3 className="text-sm font-black text-secondary uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                                <Mail size={18} className="text-primary" />
                                E-Posta Adresini Güncelle
                            </h3>

                            <form onSubmit={handleUpdateEmail} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Yeni E-Posta</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={20} />
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 rounded-2xl text-secondary outline-none focus:border-primary focus:bg-white transition-all font-bold text-sm"
                                            placeholder="yeni-posta@mail.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Doğrulama İçin Mevcut Şifre</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={20} />
                                        <input
                                            type="password"
                                            required
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
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
                                            E-Postayı Güncelle
                                            <Save size={18} className="group-hover:scale-110 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Password Change Form */}
                        <div className="bg-white border border-gray-100 rounded-3xl p-8 md:p-10 shadow-xl shadow-gray-100/50">
                            <h3 className="text-sm font-black text-secondary uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                                <Lock size={18} className="text-primary" />
                                Şifreyi Değiştir
                            </h3>

                            <form onSubmit={handlePasswordChange} className="space-y-6">
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
                                    {success && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center gap-3 text-green-600 text-sm font-bold"
                                        >
                                            <CheckCircle2 size={18} />
                                            {success}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mevcut Şifre</label>
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                if (user?.email) {
                                                    setLoading(true);
                                                    try {
                                                        const { sendPasswordResetEmail } = await import("firebase/auth");
                                                        await sendPasswordResetEmail(auth, user.email);
                                                        setSuccess("Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.");
                                                    } catch (err) {
                                                        setError("Şifre sıfırlama e-postası gönderilirken bir hata oluştu.");
                                                    } finally {
                                                        setLoading(false);
                                                    }
                                                }
                                            }}
                                            className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline disabled:opacity-50"
                                            disabled={loading}
                                        >
                                            Şifremi Unuttum
                                        </button>
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={20} />
                                        <input
                                            type="password"
                                            required
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 rounded-2xl text-secondary outline-none focus:border-primary focus:bg-white transition-all font-bold text-sm"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Yeni Şifre</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={20} />
                                            <input
                                                type="password"
                                                required
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 rounded-2xl text-secondary outline-none focus:border-primary focus:bg-white transition-all font-bold text-sm"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Yeni Şifre (Tekrar)</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={20} />
                                            <input
                                                type="password"
                                                required
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 rounded-2xl text-secondary outline-none focus:border-primary focus:bg-white transition-all font-bold text-sm"
                                                placeholder="••••••••"
                                            />
                                        </div>
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
                                            Şifreyi Güncelle
                                            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <Link href="/" className="text-secondary/30 hover:text-secondary text-[10px] font-black uppercase tracking-[0.2em] transition-colors">
                        ← Ana Sayfaya Dön
                    </Link>
                </div>
            </div>
        </div>
    );
}
