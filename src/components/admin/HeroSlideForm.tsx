"use client";
import { useState } from "react";
import { Save, Plus, Trash2, Loader2, X, Image as ImageIcon } from "lucide-react";
import { HeroSlide } from "@/types/listing";
import ImageCropper from "./ImageCropper";

interface HeroSlideFormProps {
    initialData?: HeroSlide;
    onSubmit: (data: Omit<HeroSlide, "id" | "createdAt" | "imageUrl">, imageUrl: string) => Promise<void>;
    loading: boolean;
}

export default function HeroSlideForm({ initialData, onSubmit, loading }: HeroSlideFormProps) {
    const [image, setImage] = useState<File | null>(null);
    const [video, setVideo] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>(initialData?.imageUrl || "");
    const [videoPreview, setVideoPreview] = useState<string>(initialData?.videoUrl || "");
    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        subtitle: initialData?.subtitle || "",
        order: initialData?.order || 1,
        duration: initialData?.duration || 8,
        videoStartTime: 0
    });
    const [isUploading, setIsUploading] = useState(false);

    // Cropping State
    const [croppingMedia, setCroppingMedia] = useState<{ url: string; type: "image" | "video" } | null>(null);
    const [videoStartTime, setVideoStartTime] = useState(0);
    const [videoPosition, setVideoPosition] = useState({ x: 50, y: 50 });

    const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onload = () => {
                    setCroppingMedia({ type: "image", url: reader.result as string });
                };
                reader.readAsDataURL(file);
                // Clear video when image is picked
                setVideo(null);
                setVideoPreview("");
            } else if (file.type.startsWith("video/")) {
                const url = URL.createObjectURL(file);
                setCroppingMedia({ type: "video", url });
                // Clear image when video is picked
                setImage(null);
                setPreview("");
            }
        }
    };

    const handleCropComplete = (blob: Blob | { x: number; y: number; startTime?: number; duration?: number }) => {
        if (blob instanceof Blob) {
            const file = new File([blob], "hero.jpg", { type: "image/jpeg" });
            setImage(file);
            setPreview(URL.createObjectURL(blob));
        } else {
            // Video spatial metadata (zoom/pos)
            setVideoPosition({ x: blob.x, y: blob.y });
            
            // Sync both start time and duration from visual selection
            if (blob.startTime !== undefined || blob.duration !== undefined) {
                setFormData(prev => ({ 
                    ...prev, 
                    videoStartTime: blob.startTime !== undefined ? blob.startTime : prev.videoStartTime,
                    duration: blob.duration !== undefined ? blob.duration : prev.duration
                }));
            }
            
            if (croppingMedia?.type === "video") {
                // Find the original file from event or state if needed, 
                // but since we only have one video selection at a time:
                const videoInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                if (videoInput?.files?.[0]) {
                    setVideo(videoInput.files[0]);
                    setVideoPreview(croppingMedia.url);
                }
            }
        }
        setCroppingMedia(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Form submission started (R2)...");
        setIsUploading(true);

        try {
            let finalImageUrl = initialData?.imageUrl || "";
            let finalVideoUrl = initialData?.videoUrl || "";

            // Handle Image Upload or Deletion
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
                    throw new Error(errorData.error || "Görsel yükleme başarısız oldu.");
                }

                const data = await response.json();
                finalImageUrl = data.url;
                console.log("Got R2 image URL:", finalImageUrl);
            } else if (!preview) {
                // Explicitly cleared
                finalImageUrl = "";
            }

            // Handle Video Upload or Deletion
            if (video) {
                console.log("Uploading video to R2 via API...", video.name);
                const formDataUpload = new FormData();
                formDataUpload.append("file", video);

                const response = await fetch("/api/upload", {
                    method: "POST",
                    body: formDataUpload,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Video yükleme başarısız oldu.");
                }

                const data = await response.json();
                // Append time fragment and position metadata to URL
                finalVideoUrl = `${data.url}#t=${formData.videoStartTime},${formData.videoStartTime + formData.duration}&pos=${videoPosition.x},${videoPosition.y}`;
                console.log("Got R2 video URL with metadata:", finalVideoUrl);
            } else if (!videoPreview) {
                // Explicitly cleared
                finalVideoUrl = "";
            }

            if (!finalImageUrl && !finalVideoUrl) {
                console.log("No media found, aborting.");
                alert("Lütfen bir görsel veya video seçin.");
                setIsUploading(false);
                return;
            }

            const slideData = {
                ...formData,
                imageUrl: finalImageUrl,
                videoUrl: finalVideoUrl
            };

            console.log("Calling onSubmit with data:", slideData);
            await onSubmit(slideData as any, finalImageUrl); 
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
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-black tracking-tighter uppercase text-black">
                    {initialData ? "Slaytı Düzenle" : "Yeni Slayt Ekle"}
                </h1>
                <button
                    type="submit"
                    disabled={loading || isUploading}
                    className="premium-button flex items-center gap-2 px-6 py-2.5 shadow-xl shadow-[#E10600]/20 disabled:opacity-50 text-xs font-black tracking-widest"
                >
                    {loading || isUploading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    {loading || isUploading ? "KAYDEDİLİYOR..." : "KAYDET"}
                </button>
            </div>

            <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-sm border border-neutral-400/30 uppercase">
                <h3 className="text-[#E10600] font-black mb-8 tracking-widest text-xs flex items-center gap-4">
                    <span className="w-10 h-px bg-[#E10600]/20" />
                    Slayt Bilgileri
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Media Upload (Unified) */}
                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-3">Slayt Medyası (Görsel veya Video)</label>
                        <div className="relative aspect-[21/9] w-full bg-neutral-100 rounded-[32px] overflow-hidden border-2 border-dashed border-neutral-400/30 group transition-all hover:border-[#E10600]/40">
                            {preview || videoPreview ? (
                                <>
                                    {videoPreview ? (
                                        <video src={videoPreview} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                                    ) : (
                                        <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                                    )}
                                    <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <div className="text-white flex flex-col items-center gap-2">
                                            <Plus size={32} />
                                            <span className="text-xs font-black uppercase tracking-widest">Medyayı Değiştir</span>
                                        </div>
                                        <input type="file" className="hidden" onChange={handleMediaChange} accept="image/*,video/*" />
                                    </label>
                                    <button 
                                        type="button"
                                        onClick={() => { 
                                            setImage(null); 
                                            setPreview(""); 
                                            setVideo(null); 
                                            setVideoPreview(""); 
                                        }}
                                        className="absolute top-4 right-4 w-12 h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center shadow-2xl hover:scale-110 transition-transform z-10"
                                    >
                                        <Trash2 size={24} />
                                    </button>
                                </>
                            ) : (
                                <label className="absolute inset-0 flex flex-col items-center justify-center gap-4 cursor-pointer">
                                    <div className="w-20 h-20 bg-[#E10600]/5 rounded-[24px] flex items-center justify-center">
                                        <ImageIcon className="text-[#E10600]/40" size={40} />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-black font-black text-sm uppercase tracking-widest">Dosya Seçin</p>
                                        <p className="text-neutral-400 text-[10px] font-bold mt-1">Görsel (1920x800) veya Video (MP4/WebM)</p>
                                    </div>
                                    <input type="file" className="hidden" onChange={handleMediaChange} accept="image/*,video/*" />
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-3">Başlık (Opsiyonel)</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-neutral-100 border border-neutral-400/30 p-4 rounded-xl text-black outline-none focus:border-[#E10600] transition-all font-bold"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-3">Alt Başlık (Opsiyonel)</label>
                        <input
                            type="text"
                            value={formData.subtitle}
                            onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                            className="w-full bg-neutral-100 border border-neutral-400/30 p-4 rounded-xl text-black outline-none focus:border-[#E10600] transition-all font-bold"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-3">Sıralama</label>
                        <select
                            value={formData.order}
                            onChange={e => setFormData({ ...formData, order: Number(e.target.value) })}
                            className="w-full bg-neutral-100 border border-neutral-400/30 p-4 rounded-xl text-black outline-none focus:border-[#E10600] transition-all font-bold appearance-none cursor-pointer"
                        >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                <option key={num} value={num}>{num}. Sırada Göster</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-3">Slayt Süresi (Saniye)</label>
                        <input
                            type="number"
                            min="3"
                            max="60"
                            value={formData.duration}
                            onChange={e => setFormData({ ...formData, duration: Number(e.target.value) })}
                            className="w-full bg-neutral-100 border border-neutral-400/30 p-4 rounded-xl text-black outline-none focus:border-[#E10600] transition-all font-bold"
                            placeholder="Örn: 8"
                        />
                        <p className="text-[9px] text-neutral-400 mt-2 font-bold uppercase tracking-tighter italic">Bu slaytın ekranda kalacağı toplam saniye.</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={loading || isUploading}
                    className="premium-button flex items-center gap-3 px-12 py-4 shadow-xl shadow-[#E10600]/20 disabled:opacity-50"
                >
                    {loading || isUploading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    {loading || isUploading ? "KAYDEDİLİYOR..." : "SLAYTI KAYDET"}
                </button>
            </div>

            {croppingMedia && (
                <ImageCropper
                    image={croppingMedia.url}
                    type={croppingMedia.type}
                    aspect={21 / 9}
                    initialDuration={formData.duration}
                    initialStartTime={formData.videoStartTime}
                    onCropComplete={handleCropComplete}
                    onCancel={() => setCroppingMedia(null)}
                />
            )}
        </form>
    );
}
