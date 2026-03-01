"use client";
import { useState } from "react";
import { Save, Plus, Trash2, Loader2, X, Image as ImageIcon } from "lucide-react";
import { HeroSlide } from "@/types/listing";

interface HeroSlideFormProps {
    initialData?: HeroSlide;
    onSubmit: (data: Omit<HeroSlide, "id" | "createdAt" | "imageUrl">, imageUrl: string) => Promise<void>;
    loading: boolean;
}

export default function HeroSlideForm({ initialData, onSubmit, loading }: HeroSlideFormProps) {
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>(initialData?.imageUrl || "");
    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        subtitle: initialData?.subtitle || "",
        order: initialData?.order || 0,
    });
    const [isUploading, setIsUploading] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Form submission started (R2)...");
        setIsUploading(true);

        try {
            let imageUrl = initialData?.imageUrl || "";

            if (image) {
                console.log("Uploading image to R2 via API...", image.name);
                const formDataUpload = new FormData();
                formDataUpload.append("file", image);

                const response = await fetch("/api/upload", {
                    method: "POST",
                    body: formDataUpload,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Yükleme başarısız oldu.");
                }

                const data = await response.json();
                imageUrl = data.url;
                console.log("Got R2 image URL:", imageUrl);
            }

            if (!imageUrl) {
                console.log("No image URL found, aborting.");
                alert("Lütfen bir görsel seçin.");
                setIsUploading(false);
                return;
            }

            console.log("Calling onSubmit with data:", formData);
            await onSubmit(formData, imageUrl);
            console.log("onSubmit completed successfully.");
        } catch (error: any) {
            console.error("Slayt kaydetme hatası (R2):", error);
            alert("Hata: " + (error.message || "Bilinmeyen bir hata oluştu."));
        } finally {
            setIsUploading(false);
            console.log("Form submission process finished.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-sm border border-gray-100 uppercase">
                <h3 className="text-primary font-black mb-8 tracking-widest text-xs flex items-center gap-4">
                    <span className="w-10 h-px bg-primary/20" />
                    Slayt Bilgileri
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Image Upload */}
                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Slayt Görseli</label>
                        <div className="relative aspect-[21/9] w-full bg-gray-50 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 group transition-all hover:border-primary/40">
                            {preview ? (
                                <>
                                    <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                                    <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <div className="text-white flex flex-col items-center gap-2">
                                            <Plus size={32} />
                                            <span className="text-xs font-black uppercase tracking-widest">Görseli Değiştir</span>
                                        </div>
                                        <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                                    </label>
                                </>
                            ) : (
                                <label className="absolute inset-0 flex flex-col items-center justify-center gap-4 cursor-pointer">
                                    <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center">
                                        <ImageIcon className="text-primary/40" size={32} />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-secondary font-black text-xs uppercase tracking-widest">Görsel Yükle</p>
                                        <p className="text-gray-400 text-[10px] font-bold mt-1">Önerilen: 1920x800px</p>
                                    </div>
                                    <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Başlık (Opsiyonel)</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Örn: Hayalinizdeki Eve Ss Gayrimenkul İle Kavuşun"
                            className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-secondary outline-none focus:border-primary transition-all font-bold"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Alt Başlık (Opsiyonel)</label>
                        <input
                            type="text"
                            value={formData.subtitle}
                            onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                            placeholder="Örn: Sakarya'nın en prestijli konut projeleri..."
                            className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-secondary outline-none focus:border-primary transition-all font-bold"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Sıralama (Küçükten Büyüğe)</label>
                        <input
                            type="number"
                            value={formData.order}
                            onChange={e => setFormData({ ...formData, order: Number(e.target.value) })}
                            className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-secondary outline-none focus:border-primary transition-all font-bold"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={loading || isUploading}
                    className="premium-button flex items-center gap-3 px-12 py-4 shadow-xl shadow-primary/20 disabled:opacity-50"
                >
                    {loading || isUploading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    {loading || isUploading ? "KAYDEDİLİYOR..." : "SLAYTI KAYDET"}
                </button>
            </div>
        </form>
    );
}
