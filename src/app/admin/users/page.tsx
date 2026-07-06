"use client";
import React, { useEffect, useState } from "react";
import {
    Users,
    Search,
    Shield,
    ShieldCheck,
    ArrowLeft,
    Loader2,
    Mail,
    User as UserIcon,
    Calendar,
    Plus,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import { db } from "@/lib/firebase";
import {
    collection,
    query,
    onSnapshot,
    doc,
    updateDoc,
    serverTimestamp,
    addDoc,
    getDocs,
    where,
    deleteDoc
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import AdminGuard from "@/components/admin/AdminGuard";

interface UserData {
    uid: string;
    email: string;
    displayName: string;
    role: "admin" | "user";
    createdAt?: any;
}

export default function AdminUsers() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [addingAdmin, setAddingAdmin] = useState(false);
    const [adminEmail, setAdminEmail] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const { isAdmin } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const q = query(collection(db, "users"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const usersData = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    uid: doc.id,
                    email: data.email || "",
                    displayName: data.displayName || "",
                    role: data.role || "user",
                    createdAt: data.createdAt
                };
            }) as UserData[];
            setUsers(usersData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleAddAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!adminEmail.trim()) return;

        setAddingAdmin(true);
        try {
            // Check if user already exists in Firestore
            const q = query(collection(db, "users"), where("email", "==", adminEmail.toLowerCase().trim()));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                // User exists, update all their records to admin
                const batch = querySnapshot.docs.map(userDoc =>
                    updateDoc(doc(db, "users", userDoc.id), {
                        role: "admin",
                        updatedAt: serverTimestamp()
                    })
                );
                await Promise.all(batch);
                alert("Kullanıcı başarıyla yönetici yapıldı.");
            } else {
                // User doesn't exist in Firestore, create a placeholder admin record
                await addDoc(collection(db, "users"), {
                    email: adminEmail.toLowerCase().trim(),
                    role: "admin",
                    displayName: "Bekleyen Yönetici",
                    createdAt: serverTimestamp(),
                    note: "Manuel olarak eklendi"
                });
                alert("Kullanıcı bulunamadı ancak e-posta adresi yönetici olarak yetkilendirildi. Bu e-posta ile kayıt olduğunda yönetici yetkisine sahip olacak.");
            }
            setAdminEmail("");
        } catch (error: any) {
            console.error("Add admin error:", error);
            alert("Hata: " + error.message);
        } finally {
            setAddingAdmin(false);
        }
    };

    const toggleAdmin = async (userId: string, currentRole: string) => {
        try {
            const newRole = currentRole === "admin" ? "user" : "admin";
            await updateDoc(doc(db, "users", userId), {
                role: newRole,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Toggle admin error:", error);
            alert("Yetki güncellenirken bir hata oluştu.");
        }
    };

    const deleteUserRecord = async (userId: string) => {
        if (!confirm("Bu kullanıcı kaydını silmek istediğinize emin misiniz? (Not: Sadece Firestore kaydını siler, yetkisini elinden alır.)")) return;
        try {
            await deleteDoc(doc(db, "users", userId));
        } catch (error) {
            console.error("Delete user error:", error);
        }
    };

    const filteredUsers = users.filter(u =>
        u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="animate-spin text-[#E10600]" size={40} />
            </div>
        );
    }

    return (
        <AdminGuard>
            <div className="min-h-screen bg-neutral-100 p-6 lg:p-12 pb-24">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                        <div className="flex items-center gap-6">
                            <Link
                                href="/admin/dashboard"
                                className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-black hover:text-[#E10600] transition-all shadow-sm border border-neutral-400/30"
                            >
                                <ArrowLeft size={20} />
                            </Link>
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-black tracking-tighter uppercase text-black">Kullanıcı Yönetimi</h1>
                                <p className="text-neutral-400 font-medium tracking-tight">Toplam <span className="text-[#E10600] font-black">{users.length}</span> Kayıtlı Kullanıcı / Yetki</p>
                            </div>
                        </div>
                    </div>

                    {/* Manual Add Admin & Search Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                        {/* Add Admin Form */}
                        <div className="bg-white rounded-[2.5rem] p-8 border border-neutral-400/30 shadow-xl shadow-gray-200/20">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-10 h-10 bg-[#E10600]/10 rounded-xl flex items-center justify-center text-[#E10600]">
                                    <ShieldPlus size={20} />
                                </div>
                                <h2 className="text-xl font-bold text-black">E-posta ile Yönetici Ekle</h2>
                            </div>
                            <form onSubmit={handleAddAdmin} className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400/70" size={18} />
                                    <input
                                        type="email"
                                        placeholder="admin@example.com"
                                        value={adminEmail}
                                        onChange={(e) => setAdminEmail(e.target.value)}
                                        className="w-full pl-12 pr-6 py-4 bg-neutral-100 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 text-black font-bold placeholder:text-neutral-400/70 transition-all"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={addingAdmin}
                                    className="bg-black text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#E10600] transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {addingAdmin ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                    Ekle
                                </button>
                            </form>
                            <p className="mt-4 text-[10px] text-neutral-400 font-medium">Not: Kullanıcı kayıtlı olmasa bile bu e-posta adresi sisteme girdiğinde otomatik olarak yönetici panelini görecektir.</p>
                        </div>

                        {/* Search Input */}
                        <div className="flex flex-col justify-center">
                            <div className="bg-white border border-neutral-400/30 rounded-[2.5rem] flex items-center gap-4 px-8 py-6 shadow-xl shadow-gray-200/20">
                                <Search className="text-[#E10600]" size={24} />
                                <input
                                    type="text"
                                    placeholder="Listede ara (isim veya e-posta)..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-transparent border-none outline-none text-black w-full placeholder:text-neutral-400/70 font-bold text-lg"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Users List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredUsers.map((user) => (
                                <motion.div
                                    key={user.uid}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-white rounded-[2.5rem] p-8 border border-neutral-400/30 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 transition-all group relative overflow-hidden"
                                >
                                    {/* Background Decor */}
                                    <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-[0.03] transition-transform duration-700 group-hover:scale-150 ${user.role === "admin" ? "bg-[#E10600]" : "bg-gray-400"}`} />

                                    <div className="flex flex-col items-center text-center relative z-10">
                                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 relative ${user.role === "admin" ? "bg-[#E10600]/10 text-[#E10600]" : "bg-gray-100 text-neutral-400"
                                            }`}>
                                            <UserIcon size={32} />
                                            {user.role === "admin" && (
                                                <div className="absolute -top-1 -right-1 bg-white p-1 rounded-full shadow-md">
                                                    <ShieldCheck size={20} className="text-[#E10600]" />
                                                </div>
                                            )}
                                        </div>

                                        <h3 className="text-lg font-black text-black tracking-tight mb-1 line-clamp-1">
                                            {user.displayName || "İsimsiz Kullanıcı"}
                                        </h3>

                                        <div className="flex items-center gap-2 text-neutral-400 text-xs font-bold mb-6 italic">
                                            <Mail size={12} />
                                            {user.email}
                                        </div>

                                        <div className="w-full h-px bg-neutral-100 mb-6" />

                                        <div className="flex items-center justify-between w-full mb-8">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                                                <Calendar size={12} />
                                                {user.createdAt?.toDate ? user.createdAt.toDate().toLocaleDateString("tr-TR") : "Yeni/Bekleyen"}
                                            </div>
                                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${user.role === "admin" ? "bg-[#E10600]/10 text-[#E10600] border border-[#E10600]/20" : "bg-neutral-100 text-neutral-400 border border-neutral-400/30"
                                                }`}>
                                                {user.role === "admin" ? "Yönetici" : "Müşteri"}
                                            </div>
                                        </div>

                                        <div className="flex gap-3 w-full">
                                            <button
                                                onClick={() => toggleAdmin(user.uid, user.role)}
                                                className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${user.role === "admin"
                                                    ? "bg-black text-white hover:bg-black shadow-lg shadow-black/10"
                                                    : "bg-[#E10600] text-white hover:bg-black shadow-lg shadow-[#E10600]/10"
                                                    }`}
                                            >
                                                {user.role === "admin" ? "Yetkiyi Al" : "Yönetici Yap"}
                                            </button>

                                            {/* Delete duplicate or stale records */}
                                            {(!user.displayName || user.displayName === "Bekleyen Yönetici") && (
                                                <button
                                                    onClick={() => deleteUserRecord(user.uid)}
                                                    className="w-14 h-14 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-2xl flex items-center justify-center transition-all"
                                                    title="Kaydı Sil"
                                                >
                                                    <AlertCircle size={20} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {filteredUsers.length === 0 && (
                        <div className="text-center py-20">
                            <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Users size={32} className="text-gray-200" />
                            </div>
                            <p className="text-neutral-400 font-bold uppercase tracking-widest text-xs">Aranan kriterlere uygun kullanıcı bulunamadı.</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminGuard>
    );
}

const ShieldPlus = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
);
