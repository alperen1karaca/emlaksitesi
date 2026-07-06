"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import Cropper from "react-easy-crop";
import { X, Check, ZoomIn, Scissors } from "lucide-react";

interface ImageCropperProps {
    image: string;
    type?: "image" | "video";
    aspect: number;
    initialStartTime?: number;
    initialDuration?: number;
    queueCount?: number;
    onCropComplete: (result: Blob | { x: number; y: number; startTime?: number; duration?: number }) => void;
    onCancel: () => void;
}

export default function ImageCropper({ 
    image, 
    type = "image", 
    aspect, 
    initialStartTime = 0,
    initialDuration = 8,
    queueCount, 
    onCropComplete, 
    onCancel 
}: ImageCropperProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [videoDuration, setVideoDuration] = useState(0);
    const [rangeStart, setRangeStart] = useState(initialStartTime);
    const [rangeEnd, setRangeEnd] = useState(initialStartTime + initialDuration);
    const [isDurationLoading, setIsDurationLoading] = useState(type === "video");
    const [dragging, setDragging] = useState<'start' | 'end' | null>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const cropperContainerRef = useRef<HTMLDivElement>(null);
    const durationLoadedRef = useRef(false);

    // Duration detection
    useEffect(() => {
        if (type !== "video" || !image) return;
        durationLoadedRef.current = false;

        const video = document.createElement("video");
        video.preload = "metadata";
        video.muted = true;

        const onLoaded = () => {
            if (!durationLoadedRef.current && video.duration && isFinite(video.duration)) {
                durationLoadedRef.current = true;
                const dur = video.duration;
                setVideoDuration(dur);
                setRangeStart(Math.min(initialStartTime, dur));
                setRangeEnd(Math.min(initialStartTime + initialDuration, dur));
                setIsDurationLoading(false);
            }
        };

        video.addEventListener("loadedmetadata", onLoaded);
        video.addEventListener("durationchange", onLoaded);
        video.src = image;

        const fallback = setTimeout(() => {
            if (!durationLoadedRef.current) {
                if (video.duration && isFinite(video.duration)) {
                    onLoaded();
                } else {
                    durationLoadedRef.current = true;
                    setVideoDuration(30);
                    setRangeEnd(Math.min(initialStartTime + initialDuration, 30));
                    setIsDurationLoading(false);
                }
            }
        }, 4000);

        return () => {
            video.removeEventListener("loadedmetadata", onLoaded);
            video.removeEventListener("durationchange", onLoaded);
            video.pause();
            video.src = "";
            clearTimeout(fallback);
        };
    }, [image, type]);

    // Find the video element inside the cropper and control it
    const getVideoElement = useCallback((): HTMLVideoElement | null => {
        if (!cropperContainerRef.current) return null;
        return cropperContainerRef.current.querySelector("video");
    }, []);

    // Seek video when handles move
    useEffect(() => {
        if (type !== "video" || isDurationLoading) return;
        const vid = getVideoElement();
        if (!vid) return;

        if (dragging === 'start') {
            vid.currentTime = rangeStart;
        } else if (dragging === 'end') {
            vid.currentTime = Math.max(rangeEnd - 0.5, rangeStart);
        }
    }, [rangeStart, rangeEnd, dragging, type, isDurationLoading, getVideoElement]);

    // Loop video within selected range
    useEffect(() => {
        if (type !== "video" || isDurationLoading) return;

        const interval = setInterval(() => {
            const vid = getVideoElement();
            if (!vid || dragging) return;

            if (vid.currentTime < rangeStart - 0.3 || vid.currentTime >= rangeEnd) {
                vid.currentTime = rangeStart;
            }
        }, 200);

        return () => clearInterval(interval);
    }, [type, isDurationLoading, rangeStart, rangeEnd, dragging, getVideoElement]);

    // Seek to start on initial load
    useEffect(() => {
        if (type !== "video" || isDurationLoading) return;
        const trySeek = setTimeout(() => {
            const vid = getVideoElement();
            if (vid) vid.currentTime = rangeStart;
        }, 500);
        return () => clearTimeout(trySeek);
    }, [isDurationLoading]);

    // Drag logic
    const getTimeFromEvent = useCallback((clientX: number): number => {
        if (!trackRef.current || videoDuration <= 0) return 0;
        const rect = trackRef.current.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        return Math.round(pct * videoDuration * 10) / 10;
    }, [videoDuration]);

    useEffect(() => {
        if (!dragging) return;

        const onMove = (clientX: number) => {
            const t = getTimeFromEvent(clientX);
            if (dragging === 'start') {
                setRangeStart(Math.max(0, Math.min(t, rangeEnd - 1)));
            } else {
                setRangeEnd(Math.min(videoDuration, Math.max(t, rangeStart + 1)));
            }
        };

        const handleMouseMove = (e: MouseEvent) => onMove(e.clientX);
        const handleTouchMove = (e: TouchEvent) => onMove(e.touches[0].clientX);
        const handleUp = () => setDragging(null);

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('touchmove', handleTouchMove);
        document.addEventListener('mouseup', handleUp);
        document.addEventListener('touchend', handleUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('mouseup', handleUp);
            document.removeEventListener('touchend', handleUp);
        };
    }, [dragging, getTimeFromEvent, videoDuration, rangeStart, rangeEnd]);

    const onCropChange = (c: { x: number; y: number }) => setCrop(c);
    const onZoomChange = (z: number) => setZoom(z);
    const onCropCompleteInternal = useCallback((_: any, pixels: any) => setCroppedAreaPixels(pixels), []);

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const img = new Image();
            img.addEventListener("load", () => resolve(img));
            img.addEventListener("error", reject);
            img.crossOrigin = "anonymous";
            img.src = url;
        });

    const getCroppedImg = async () => {
        if (type === "video") {
            return {
                x: 50 - (crop.x / zoom),
                y: 50 - (crop.y / zoom),
                startTime: rangeStart,
                duration: rangeEnd - rangeStart
            };
        }
        try {
            const img = await createImage(image);
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx || !croppedAreaPixels) return;
            canvas.width = croppedAreaPixels.width;
            canvas.height = croppedAreaPixels.height;
            ctx.drawImage(img, croppedAreaPixels.x, croppedAreaPixels.y, croppedAreaPixels.width, croppedAreaPixels.height, 0, 0, croppedAreaPixels.width, croppedAreaPixels.height);
            return new Promise<Blob>((resolve) => canvas.toBlob((blob) => resolve(blob!), "image/jpeg", 0.95));
        } catch (e) {
            console.error(e);
        }
    };

    const handleDone = async () => {
        const result = await getCroppedImg();
        if (result) onCropComplete(result as any);
    };

    const startPct = videoDuration > 0 ? (rangeStart / videoDuration) * 100 : 0;
    const endPct = videoDuration > 0 ? (rangeEnd / videoDuration) * 100 : 100;

    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[200] flex flex-col items-center justify-center p-4 md:p-8">
            <div className="w-full max-w-4xl bg-white rounded-[40px] overflow-hidden shadow-2xl flex flex-col h-[90vh] md:h-[85vh]">
                {/* Header */}
                <div className="p-6 md:p-8 flex items-center justify-between border-b border-neutral-400/30">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#E10600]/10 rounded-2xl flex items-center justify-center text-[#E10600]">
                            {type === "video" ? <Scissors size={24} /> : <ZoomIn size={24} />}
                        </div>
                        <div>
                            <h2 className="text-xl md:text-2xl font-black text-black uppercase tracking-tighter">
                                {type === "video" ? "Video Kesim Alanı" : "Görseli Kırp"}
                            </h2>
                            <p className="text-neutral-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                                {type === "video" ? "Başlangıç ve bitiş çubuklarını sürükleyerek aralığı seçin" : "İstediğiniz alanı seçerek düzenleyin"}
                            </p>
                        </div>
                    </div>
                    <button type="button" onClick={onCancel} className="w-12 h-12 bg-neutral-100 rounded-2xl flex items-center justify-center hover:bg-neutral-200 transition-all text-neutral-400 hover:text-black">
                        <X size={24} />
                    </button>
                </div>

                {/* Cropper */}
                <div ref={cropperContainerRef} className="flex-1 relative bg-[#2B2B2B] border-y border-neutral-400/30">
                    <Cropper
                        image={type === "image" ? image : undefined}
                        video={type === "video" ? image : undefined}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspect}
                        onCropChange={onCropChange}
                        onCropComplete={onCropCompleteInternal}
                        onZoomChange={onZoomChange}
                    />
                    {type === "video" && !isDurationLoading && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 bg-black/70 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/10 text-white text-[10px] font-bold tracking-wider">
                            {rangeStart.toFixed(1)}s → {rangeEnd.toFixed(1)}s ({(rangeEnd - rangeStart).toFixed(1)}s seçildi)
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="p-6 md:p-8 space-y-6 bg-white">
                    {/* Video Timeline */}
                    {type === "video" && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                                <span className="flex items-center gap-2"><Scissors size={14} /> Video Aralığı</span>
                                {isDurationLoading 
                                    ? <span className="text-[#E10600]">Yükleniyor...</span>
                                    : <span>{rangeStart.toFixed(1)}s — {rangeEnd.toFixed(1)}s / {videoDuration.toFixed(1)}s</span>
                                }
                            </div>

                            <div 
                                ref={trackRef} 
                                className="relative h-10 select-none"
                                style={{ opacity: isDurationLoading ? 0.3 : 1 }}
                            >
                                <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-2 bg-neutral-200 rounded-full" />
                                <div 
                                    className="absolute top-1/2 -translate-y-1/2 h-2 bg-[#E10600] rounded-full"
                                    style={{ left: `${startPct}%`, width: `${endPct - startPct}%` }}
                                />

                                {/* Start Handle */}
                                <div 
                                    onMouseDown={() => !isDurationLoading && setDragging('start')}
                                    onTouchStart={() => !isDurationLoading && setDragging('start')}
                                    className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-[3px] border-[#E10600] rounded-full z-20 shadow-lg cursor-grab active:cursor-grabbing hover:shadow-xl ${dragging === 'start' ? 'scale-125 shadow-xl' : ''}`}
                                    style={{ left: `calc(${startPct}% - 12px)` }}
                                />

                                {/* End Handle */}
                                <div 
                                    onMouseDown={() => !isDurationLoading && setDragging('end')}
                                    onTouchStart={() => !isDurationLoading && setDragging('end')}
                                    className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-[3px] border-[#E10600] rounded-full z-20 shadow-lg cursor-grab active:cursor-grabbing hover:shadow-xl ${dragging === 'end' ? 'scale-125 shadow-xl' : ''}`}
                                    style={{ left: `calc(${endPct}% - 12px)` }}
                                />

                                <div className="absolute -bottom-4 left-0 text-[8px] text-neutral-400 font-bold">0s</div>
                                <div className="absolute -bottom-4 right-0 text-[8px] text-neutral-400 font-bold">{videoDuration.toFixed(0)}s</div>
                            </div>
                        </div>
                    )}

                    {/* Zoom */}
                    <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
                        <div className="flex-1 w-full space-y-3">
                            <div className="flex items-center justify-between text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                                <span className="flex items-center gap-2"><ZoomIn size={14} /> Yakınlaştırma</span>
                                <span>%{Math.round(zoom * 100)}</span>
                            </div>
                            <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => onZoomChange(Number(e.target.value))} className="w-full h-2 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-[#E10600]" />
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <button type="button" onClick={onCancel} className="flex-1 md:flex-none px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-black bg-neutral-100 hover:bg-neutral-200 transition-all">İptal</button>
                            <button type="button" onClick={handleDone} disabled={isDurationLoading && type === "video"} className="flex-1 md:flex-none px-12 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white bg-[#E10600] shadow-xl shadow-[#E10600]/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                                <Check size={18} /> Tamamla
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
