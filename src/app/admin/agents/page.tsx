"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { Agent } from "@/types/listing";
import { Plus, Trash2, Edit2, Save, X, User, Phone, Mail, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import AdminGuard from "@/components/admin/AdminGuard";
import ImageCropper from "@/components/admin/ImageCropper";

export default function AgentsPage() {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState<Omit<Agent, "id">>({
        name: "",
        title: "Gayrimenkul Danışmanı",
        phone: "",
        email: "",
        imageUrl: ""
    });

    // Cropping State
    const [croppingImage, setCroppingImage] = useState<string | null>(null);
    const [originalFile, setOriginalFile] = useState<File | null>(null);

    useEffect(() => {
        fetchAgents();
    }, []);

    const fetchAgents = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "agents"));
            const agentsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Agent[];
            setAgents(agentsData);
        } catch (error) {
            console.error("Hata:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        const file = e.target.files[0];
        setOriginalFile(file);
        const reader = new FileReader();
        reader.onload = () => {
            setCroppingImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleCropComplete = async (result: Blob | { x: number; y: number; startTime?: number; duration?: number }) => {
        if (!(result instanceof Blob)) return;
        const blob = result;
        if (!originalFile) return;
        setUploading(true);
        setCroppingImage(null);
        try {
            const formDataUpload = new FormData();
            formDataUpload.append("file", new File([blob], originalFile.name, { type: "image/jpeg" }));

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formDataUpload,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Yükleme başarısız oldu.");
            }

            const data = await response.json();
            setFormData(prev => ({ ...prev, imageUrl: data.url }));
        } catch (error: any) {
            console.error("Upload hatası:", error);
            alert("Resim yüklenirken bir hata oluştu: " + error.message);
        } finally {
            setUploading(false);
            setOriginalFile(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editingAgent) {
                await updateDoc(doc(db, "agents", editingAgent.id!), {
                    ...formData
                });
            } else {
                await addDoc(collection(db, "agents"), {
                    ...formData,
                    createdAt: serverTimestamp()
                });
            }
            setIsModalOpen(false);
            setEditingAgent(null);
            setFormData({ name: "", title: "Gayrimenkul Danışmanı", phone: "", email: "", imageUrl: "" });
            fetchAgents();
        } catch (error) {
            console.error("Hata:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, imageUrl?: string) => {
        if (!confirm("Bu danışmanı silmek istediğinize emin misiniz?")) return;
        try {
            // Delete from R2 first
            if (imageUrl) {
                await fetch("/api/delete", {
                    method: "POST",
                    body: JSON.stringify({ urls: [imageUrl] }),
                });
            }

            // Then delete from Firestore
            await deleteDoc(doc(db, "agents", id));
            fetchAgents();
        } catch (error) {
            console.error("Hata:", error);
        }
    };

    const openEdit = (agent: Agent) => {
        setEditingAgent(agent);
        setFormData({
            name: agent.name,
            title: agent.title,
            phone: agent.phone,
            email: agent.email,
            imageUrl: agent.imageUrl || ""
        });
        setIsModalOpen(true);
    };

    return (
        <AdminGuard>
            <div className="p-8 lg:p-12 max-w-7xl mx-auto min-h-screen bg-white">
                <Link
                    href="/admin/dashboard"
                    className="inline-flex items-center gap-2 text-neutral-400 hover:text-[#E10600] transition-colors font-bold uppercase tracking-widest text-[10px] mb-8 group"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    Panel'e Geri Dön
                </Link>

                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter uppercase text-black">Danışman Yönetimi</h1>
                        <p className="text-neutral-400 font-medium">Ekibinizi yönetin ve ilanlara atayın.</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingAgent(null);
                            setFormData({ name: "", title: "Gayrimenkul Danışmanı", phone: "", email: "", imageUrl: "" });
                            setIsModalOpen(true);
                        }}
                        className="bg-[#E10600] text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-[#E10600]/20 hover:scale-105 transition-all uppercase tracking-widest text-xs"
                    >
                        <Plus size={20} /> Yeni Danışman Ekle
                    </button>
                </div>

                {loading && agents.length === 0 ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="animate-spin text-[#E10600]" size={48} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {agents.map((agent) => (
                            <div key={agent.id} className="bg-white rounded-3xl p-8 shadow-sm border border-neutral-400/30 group hover:shadow-xl transition-all">
                                <div className="flex items-center gap-6 mb-8">
                                    <div className="w-20 h-20 rounded-2xl bg-neutral-100 overflow-hidden border border-neutral-400/30 flex items-center justify-center shrink-0">
                                        {agent.imageUrl ? (
                                            <img src={agent.imageUrl} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="text-neutral-400/70" size={32} />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-black text-black uppercase tracking-tighter truncate text-lg leading-tight">{agent.name}</h3>
                                        <p className="text-[#E10600] font-bold text-xs uppercase tracking-widest">{agent.title}</p>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center gap-3 text-neutral-400 font-medium text-sm">
                                        <Phone size={16} className="text-[#E10600]/40" />
                                        <span>{agent.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-neutral-400 font-medium text-sm">
                                        <Mail size={16} className="text-[#E10600]/40" />
                                        <span className="truncate">{agent.email}</span>
                                    </div>
                                </div>

                                <div className="flex gap-3 border-t border-gray-50 pt-6">
                                    <button
                                        onClick={() => openEdit(agent)}
                                        className="flex-1 bg-neutral-100 text-black font-black text-[10px] uppercase tracking-widest py-3 rounded-xl hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2"
                                    >
                                        <Edit2 size={14} /> Düzenle
                                    </button>
                                    <button
                                        onClick={() => handleDelete(agent.id!, agent.imageUrl)}
                                        className="w-12 h-12 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {isModalOpen && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
                        <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                            <div className="p-10">
                                <div className="flex justify-between items-center mb-10">
                                    <h2 className="text-2xl font-black text-black tracking-tighter uppercase">
                                        {editingAgent ? "Danışmanı Düzenle" : "Yeni Danışman"}
                                    </h2>
                                    <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center hover:bg-gray-100 transition-all">
                                        <X size={20} className="text-neutral-400" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="flex justify-center mb-8">
                                        <label className="relative group cursor-pointer">
                                            <div className="w-32 h-32 rounded-[32px] bg-neutral-100 overflow-hidden border-2 border-dashed border-neutral-400/50 group-hover:border-[#E10600] transition-all flex items-center justify-center">
                                                {formData.imageUrl ? (
                                                    <img src={formData.imageUrl} className="w-full h-full object-cover" />
                                                ) : uploading ? (
                                                    <Loader2 className="animate-spin text-[#E10600]" size={32} />
                                                ) : (
                                                    <Plus className="text-neutral-400/70 group-hover:text-[#E10600] transition-all" size={32} />
                                                )}
                                            </div>
                                            <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                                            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white shadow-lg rounded-xl flex items-center justify-center text-[#E10600] border border-neutral-400/30">
                                                <User size={20} />
                                            </div>
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-3 block">Ad Soyad</label>
                                            <input
                                                required
                                                type="text"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full bg-neutral-100 border border-neutral-400/30 p-4 rounded-2xl font-bold text-black focus:border-[#E10600] outline-none transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-3 block">Ünvan</label>
                                            <input
                                                required
                                                type="text"
                                                value={formData.title}
                                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                                className="w-full bg-neutral-100 border border-neutral-400/30 p-4 rounded-2xl font-bold text-black focus:border-[#E10600] outline-none transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-3 block">Telefon</label>
                                            <input
                                                required
                                                type="text"
                                                value={formData.phone}
                                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full bg-neutral-100 border border-neutral-400/30 p-4 rounded-2xl font-bold text-black focus:border-[#E10600] outline-none transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-3 block">E-Posta</label>
                                            <input
                                                required
                                                type="email"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full bg-neutral-100 border border-neutral-400/30 p-4 rounded-2xl font-bold text-black focus:border-[#E10600] outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-[#E10600] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl shadow-[#E10600]/30 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all mt-6"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                        KAYDET
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {croppingImage && (
                    <ImageCropper
                        image={croppingImage}
                        aspect={1 / 1}
                        onCropComplete={handleCropComplete}
                        onCancel={() => {
                            setCroppingImage(null);
                            setOriginalFile(null);
                        }}
                    />
                )}
            </div>
        </AdminGuard>
    );
}
