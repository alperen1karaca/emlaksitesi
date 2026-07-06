"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Save, Plus, Trash2, Loader2, X, User, AlertCircle } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Listing, ListingFeatureCategory, Agent } from "@/types/listing";
import { CITY_LOCATIONS, DISTRICT_CENTERS, CITIES } from "@/constants/locations";

const MapPicker = dynamic(() => import("./MapPicker"), {
    ssr: false,
    loading: () => <div className="h-[400px] bg-neutral-100 rounded-xl animate-pulse flex items-center justify-center text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Harita Yükleniyor...</div>
});

import ImageCropper from "./ImageCropper";

interface ListingFormProps {
    initialData?: Listing;
    onSubmit: (data: Omit<Listing, "id" | "createdAt" | "images">, imageUrls: string[]) => Promise<void>;
    loading: boolean;
}

export default function ListingForm({ initialData, onSubmit, loading }: ListingFormProps) {
    const [images, setImages] = useState<File[]>([]);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [previews, setPreviews] = useState<string[]>(initialData?.images || []);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [geocoding, setGeocoding] = useState(false);
    const [geocodingCache, setGeocodingCache] = useState<Record<string, { lat: number; lng: number; zoom: number }>>({});
    const abortControllerRef = useRef<AbortController | null>(null);
    const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number; zoom?: number } | null>(
        initialData?.location.city && initialData?.location.district 
            ? { ...DISTRICT_CENTERS[initialData.location.city]?.[initialData.location.district], zoom: 13 } : null
    );

    // Sessiz harita odaklama fonksiyonu: Mahallelere daha iyi uçmak için alternatif aramalar yapar
    const flyToLocation = async (query: string, district?: string, isNeighborhood = false) => {
        if (!query) return;

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        try {
            let data = [];
            
            if (isNeighborhood && district) {
                const cleanName = query.replace(/\s+Mah\.?$/i, '').trim();
                const variations = [
                    `${cleanName} Mahallesi, ${district}, ${formData.location.city}, Türkiye`,
                    `${cleanName}, ${district}, ${formData.location.city}, Türkiye`,
                    `${cleanName} Köyü, ${district}, ${formData.location.city}, Türkiye`,
                    `${cleanName}, ${district}, ${formData.location.city}`
                ];
                
                for (const v of variations) {
                    const res = await fetch(`/api/geocode?q=${encodeURIComponent(v)}`, {
                        signal: abortControllerRef.current.signal
                    });
                    const result = await res.json();
                    if (result && result.length > 0) {
                        data = result;
                        break;
                    }
                    await new Promise(r => setTimeout(r, 600)); // Rate limit beklemesi
                }
            } else {
                const variations = [
                    `${query}, ${formData.location.city || 'Sakarya'}, Türkiye`,
                    `${query}, ${formData.location.city || 'Sakarya'}`
                ];
                for (const v of variations) {
                    const res = await fetch(`/api/geocode?q=${encodeURIComponent(v)}`, {
                        signal: abortControllerRef.current.signal
                    });
                    const result = await res.json();
                    if (result && result.length > 0) {
                        data = result;
                        break;
                    }
                    await new Promise(r => setTimeout(r, 600));
                }
            }
            
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                const zoomLevel = isNeighborhood ? 16 : 13;
                setMapCenter({ lat: parseFloat(lat), lng: parseFloat(lon), zoom: zoomLevel });
            } else {
                console.log("Konum bulunamadı:", query);
            }
        } catch (error) {
            if (error instanceof Error && error.name !== 'AbortError') {
                console.error("Geocoding failed:", error);
            }
        }
    };

    // Cropping States
    const [cropQueue, setCropQueue] = useState<File[]>([]);
    const [currentCropImage, setCurrentCropImage] = useState<string | null>(null);

    useEffect(() => {
        fetchAgents();
    }, []);

    useEffect(() => {
        if (cropQueue.length > 0 && !currentCropImage) {
            const file = cropQueue[0];
            const reader = new FileReader();
            reader.onload = () => {
                setCurrentCropImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }, [cropQueue, currentCropImage]);

    const handleCropComplete = (result: Blob | { x: number; y: number; startTime?: number; duration?: number }) => {
        if (!(result instanceof Blob)) return;
        const blob = result;
        const file = new File([blob], cropQueue[0].name, { type: "image/jpeg" });
        setImages(prev => [...prev, file]);
        setPreviews(prev => [...prev, URL.createObjectURL(blob)]);

        // Remove processed image from queue
        setCropQueue(prev => prev.slice(1));
        setCurrentCropImage(null);
    };

    const handleCropCancel = () => {
        // Just remove from queue and move on
        setCropQueue(prev => prev.slice(1));
        setCurrentCropImage(null);
    };

    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            const items = e.clipboardData?.items;
            if (!items) return;
 
            const files: File[] = [];
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf("image") !== -1) {
                    const blob = items[i].getAsFile();
                    if (blob) {
                        const file = new File([blob], `pasted-image-${Date.now()}-${i}.png`, { type: blob.type });
                        files.push(file);
                    }
                }
            }
 
            if (files.length > 0) {
                setCropQueue(prev => [...prev, ...files]);
            }
        };
 
        window.addEventListener("paste", handlePaste);
        return () => window.removeEventListener("paste", handlePaste);
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
            console.error("Agents fetch error:", error);
        }
    };

    // Initial Form State
    const [formData, setFormData] = useState<Omit<Listing, "id" | "createdAt" | "images">>({
        title: initialData?.title || "",
        description: initialData?.description || "",
        price: initialData?.price || "" as any,
        type: initialData?.type || "SATILIK",
        category: initialData?.category || "KONUT",
        agentId: initialData?.agentId || "",
        location: initialData?.location || {
            city: "",
            district: "",
            neighborhood: "",
            fullAddress: "",
        },
        details: initialData?.details || {
            listingId: "",
            propertyType: "",
            grossM2: "",
            netM2: "",
            roomCount: "",
            buildingAge: "",
            floorLevel: "",
            totalFloors: "",
            heating: "",
            bathroomCount: "",
            balcony: false,
            elevator: false,
            parking: "",
            furnished: false,
            usageStatus: "",
            kitchen: "",
            withinSite: false,
            creditEligible: false,
            titleDeedStatus: "",
            from: "",
            exchange: false,
        },
        features: initialData?.features || {
            interior: [],
            exterior: [],
            neighborhood: [],
            transportation: [],
            landscape: [],
            infrastructure: [],
            housingType: [],
            disabledFriendly: [],
            proximity: [],
        },
        sahibindenUrl: initialData?.sahibindenUrl || "",
        userId: initialData?.userId || "",
        status: initialData?.status || "pending"
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setCropQueue(prev => [...prev, ...newFiles]);
            e.target.value = ""; // Reset value to allow selecting the same file again
        }
    };

    const removePreview = (index: number) => {
        // If it's an existing image (string), we might want to handle it differently, 
        // but for now let's just remove from preview list
        setPreviews(prev => prev.filter((_, i) => i !== index));
        // Also remove from local files if it's there
        // Note: index mapping might be tricky if mixed
        // To simplify, let's just reset images if previews are removed for now or manage indices
    };

    const handleFeatureToggle = (category: ListingFeatureCategory, feature: string) => {
        setFormData(prev => ({
            ...prev,
            features: {
                ...prev.features,
                [category]: prev.features[category].includes(feature)
                    ? prev.features[category].filter(f => f !== feature)
                    : [...prev.features[category], feature]
            }
        }));
    };

    const handleSubmit = async () => {
        // Validation Checks
        const errors: Record<string, string> = {};
        if (previews.length === 0) errors.images = "En az bir görsel yüklenmelidir.";
        if (!formData.description.trim()) errors.description = "İlan açıklaması boş bırakılamaz.";
        if (!formData.title.trim()) errors.title = "İlan başlığı boş bırakılamaz.";
        if (!formData.price || Number(formData.price) <= 0) errors.price = "Geçerli bir fiyat girilmelidir.";
        if (!formData.location.district || !formData.location.neighborhood || !formData.location.fullAddress.trim()) {
            errors.location = "İlçe, mahalle ve tam adres bilgileri eksiksiz girilmelidir.";
        }
        if (!formData.details.propertyType) errors.propertyType = "İlan/Emlak tipi belirtilmelidir.";
        if (formData.category !== "ARSA" && (!formData.details.grossM2 || !formData.details.roomCount)) {
            errors.specs = "Metre Kare ve Oda sayısı bilgileri girilmelidir.";
        }
        if (formData.category === "ARSA" && (!formData.details.grossM2 || !formData.details.zoningStatus)) {
            errors.specs = "Metre Kare ve İmar durumu bilgileri girilmelidir.";
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            
            // Auto-scroll to the first error found to improve UX
            const firstErrorElement = document.querySelector('.validation-error-anchor');
            if (firstErrorElement) {
                firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        setValidationErrors({});

        // Separate already uploaded URLs from new files
        const existingUrls = previews.filter(p => p.startsWith("http"));

        // Upload new images to R2 via API
        const newImageUrls = await Promise.all(
            images.map(async (file) => {
                const formDataUpload = new FormData();
                formDataUpload.append("file", file);

                const response = await fetch("/api/upload", {
                    method: "POST",
                    body: formDataUpload,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Yükleme başarısız oldu.");
                }

                const data = await response.json();
                return data.url;
            })
        );

        const allImages = [...existingUrls, ...newImageUrls];
        
        // Ensure netM2 is always same as grossM2 for the simplified single field
        const finalFormData = {
            ...formData,
            details: {
                ...formData.details,
                netM2: formData.details.grossM2 // Sync both for backend compatibility
            }
        };

        await onSubmit(finalFormData, allImages);
    };



    const infraCategory = {
        id: "infrastructure" as ListingFeatureCategory,
        label: "Altyapı",
        options: ["Elektrik", "Sanayi Elektriği", "Su", "Telefon", "Doğalgaz", "Kanalizasyon", "Arıtma", "Sondaj & Kuyu", "Zemin Etüdü", "Yolu Açılmış", "Yolu Açılmamış", "Yolu Yok"]
    };

    const neighborhoodCategory = {
        id: "neighborhood" as ListingFeatureCategory,
        label: "Muhit",
        options: [
            "Alışveriş Merkezi", "Belediye", "Cami", "Cemevi", "Denize Sıfır", "Eczane",
            "Eğlence Merkezi", "Fuar", "Göle Sıfır", "Hastane", "Havra", "İlkokul-Ortaokul",
            "İtfaiye", "Kilise", "Lise", "Market", "Park", "Plaj", "Polis Merkezi",
            "Sağlık Ocağı", "Semt Pazarı", "Spor Salonu", "Şehir Merkezi", "Üniversite"
        ]
    };

    const transportationCategory = {
        id: "transportation" as ListingFeatureCategory,
        label: "Ulaşım",
        options: [
            "Anayol", "Avrasya Tüneli", "Boğaz Köprüleri", "Cadde", "Deniz Otobüsü",
            "Dolmuş", "E-5", "Havaalanı", "İskele", "Marmaray", "Metro", "Metrobüs",
            "Minibüs", "Otobüs Durağı", "Sahil", "Teleferik", "TEM", "Tramvay",
            "Tren İstasyonu", "Trolleybüs"
        ]
    };

    const featureCategories: { id: ListingFeatureCategory; label: string; options: string[] }[] = formData.category === "ARSA" ? [
        {
            id: "interior",
            label: "Genel Özellikler",
            options: ["İfrazlı", "Parselli", "Projeli", "Köşe Parsel"]
        },
        {
            id: "landscape",
            label: "Manzara",
            options: ["Şehir", "Deniz", "Doğa", "Boğaz", "Göl"]
        },
        {
            id: "proximity",
            label: "Konum",
            options: ["Ana Yola Yakın", "Denize Sıfır", "Denize Yakın", "Havaalanına Yakın", "Toplu Ulaşıma Yakın"]
        },
        infraCategory,
        {
            id: "exterior",
            label: "Kullanım Amacı",
            options: ["Konut", "Ticari", "Sanayi", "Tarım", "Turizm", "Bağ & Bahçe", "Villa", "Prefabrik Uygun"]
        },
    ] : [
        {
            id: "interior",
            label: "İç Özellikler",
            options: [
                "ADSL", "Ahşap Doğrama", "Akıllı Ev", "Alarm (Hırsız)", "Alarm (Yangın)",
                "Alaturka Tuvalet", "Alüminyum Doğrama", "Amerikan Kapı", "Ankastre Fırın",
                "Barbekü", "Beyaz Eşya", "Boyalı", "Bulaşık Makinesi", "Buzdolabı",
                "Çamaşır Kurutma Makinesi", "Çamaşır Makinesi", "Çamaşır Odası", "Çelik Kapı",
                "Duşakabin", "Duvar Kağıdı", "Ebeveyn Banyosu", "Fırın", "Fiber İnternet",
                "Giyinme Odası", "Gömme Dolap", "Görüntülü Diafon", "Hilton Banyo", "Intercom Sistemi",
                "Isıcam", "Jakuzi", "Kartonpiyer", "Kiler", "Klima", "Küvet", "Laminat Zemin",
                "Marley", "Mobilya", "Mutfak (Ankastre)", "Mutfak (Laminat)", "Mutfak Doğalgazı",
                "Panjur/Jaluzi", "Parke Zemin", "PVC Doğrama", "Seramik Zemin", "Set Üstü Ocak",
                "Spot Aydınlatma", "Şofben", "Şömine", "Teras", "Termosifon", "Vestiyer", "Wi-Fi",
                "Yüz mi Tanıma & Parmak İzi"
            ]
        },
        {
            id: "exterior",
            label: "Dış Özellikler",
            options: [
                "Araç Şarj İstasyonu", "24 Saat Güvenlik", "Apartman Görevlisi", "Buhar Odası",
                "Çocuk Oyun Parkı", "Hamam", "Hidrofor", "Isı Yalıtımı", "Jeneratör",
                "Kablo TV", "Kamera Sistemi", "Köpek Parkı", "Kreş", "Müstakil Havuzlu",
                "Sauna", "Ses Yalıtımı", "Siding", "Spor Alanı", "Su Deposu", "Tenis Kortu",
                "Uydu", "Yangın Merdiveni", "Yüzme Havuzu (Açık)", "Yüzme Havuzu (Kapalı)"
            ]
        },
        infraCategory,
        neighborhoodCategory,
        transportationCategory,
        {
            id: "landscape",
            label: "Manzara",
            options: ["Boğaz", "Deniz", "Doğa", "Göl", "Havuz", "Nehir", "Park & Yeşil Alan", "Şehir"]
        },
        {
            id: "housingType",
            label: formData.category === "OFİS" ? "Ofis Tipi" : "Konut Tipi",
            options: ["Dubleks", "En Üst Kat", "Ara Kat", "Ara Kat Dubleks", "Bahçe Dubleksi", "Çatı Dubleksi", "Forleks", "Ters Dubleks", "Tripleks"]
        },
        {
            id: "disabledFriendly",
            label: "Engelliye ve Yaşlıya Uygun",
            options: [
                "Araç Park Yeri", "Engelliye Uygun Asansör", "Engelliye Uygun Banyo", "Engelliye Uygun Mutfak",
                "Engelliye Uygun Park", "Geniş Koridor", "Giriş / Rampa", "Merdiven", "Oda Kapısı",
                "Priz / Elektrik Anahtarı", "Tutamak / Korkuluk", "Tuvalet", "Yüzme Havuzu"
            ]
        }
    ];

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 md:mb-12">
                <div>
                    <h1 className="text-2xl md:text-4xl font-extrabold tracking-tighter mb-2 uppercase">{initialData ? "İlanı Düzenle" : "Yeni İlan Ekle"}</h1>
                    <p className="text-xs md:text-base text-neutral-400 font-medium">SS Gayrimenkul Portföy Yönetimi</p>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="premium-button flex items-center gap-2 px-6 md:px-12 py-2.5 md:py-4 shadow-xl shadow-[#E10600]/20 disabled:opacity-50 w-full md:w-auto justify-center text-xs md:text-sm font-black tracking-widest"
                >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    {loading ? "KAYDEDİLİYOR..." : "KAYDET"}
                </button>
            </div>

            <div className="space-y-4 md:space-y-10">
                {/* Images */}
                <section key="section-images" className={`${validationErrors.images ? 'validation-error-anchor' : ''} bg-white rounded-xl md:rounded-3xl px-4 py-5 md:p-10 shadow-sm border ${validationErrors.images ? 'border-[#E10600]' : 'border-neutral-400/30'}`}>
                    <h3 className="text-[#E10600] font-black mb-6 md:mb-8 uppercase tracking-widest text-[10px] md:text-xs flex items-center gap-4">
                        <span className="w-6 md:w-10 h-px bg-[#E10600]/20" />
                        Görseller
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-4">
                        {previews.map((src, i) => (
                            <div key={i} className="relative aspect-square rounded-xl md:rounded-2xl overflow-hidden group border border-neutral-400/30 bg-neutral-100">
                                <img src={src} className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removePreview(i)}
                                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="text-white" size={20} />
                                </button>
                            </div>
                        ))}

                        <label className="flex flex-col items-center justify-center aspect-square rounded-xl md:rounded-2xl border-2 border-dashed border-neutral-400/50 hover:border-[#E10600]/40 transition-all cursor-pointer bg-neutral-100/50 group">
                            <Plus className="text-neutral-400/70 group-hover:text-[#E10600] group-hover:scale-110 transition-transform mb-2" size={28} />
                            <span className="text-[8px] md:text-[10px] font-black text-neutral-400 uppercase tracking-widest text-center px-2">Görsel Ekle</span>
                            <input type="file" multiple className="hidden" onChange={handleImageChange} accept="image/*" />
                        </label>
                    </div>
                    {validationErrors.images && (
                        <p className="text-[#E10600] text-xs font-bold mt-4 flex items-center gap-1">
                            <AlertCircle size={14} /> {validationErrors.images}
                        </p>
                    )}
                </section>

                {/* Description */}
                <section key="section-description" className={`${validationErrors.description ? 'validation-error-anchor' : ''} bg-white rounded-2xl md:rounded-3xl p-5 md:p-10 shadow-sm border ${validationErrors.description ? 'border-[#E10600]' : 'border-neutral-400/30'}`}>
                    <h3 className="text-[#E10600] font-black mb-6 md:mb-8 uppercase tracking-widest text-[10px] md:text-xs flex items-center gap-4">
                        <span className="w-6 md:w-10 h-px bg-[#E10600]/20" />
                        Açıklama
                    </h3>
                    <textarea
                        rows={4}
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        placeholder=""
                        className={`w-full bg-neutral-100 border ${validationErrors.description ? 'border-[#E10600]' : 'border-neutral-400/30'} p-4 md:p-6 rounded-xl md:rounded-2xl text-black outline-none focus:border-[#E10600] transition-all font-medium leading-relaxed text-xs md:text-base min-h-[120px]`}
                    ></textarea>
                    {validationErrors.description && (
                        <p className="text-[#E10600] text-xs font-bold mt-2 flex items-center gap-1">
                            <AlertCircle size={14} /> {validationErrors.description}
                        </p>
                    )}
                </section>

                {/* Basic Info */}
                <section key="section-basic" className={`${validationErrors.title ? 'validation-error-anchor' : ''} bg-white rounded-2xl md:rounded-3xl p-5 md:p-10 shadow-sm border ${Object.keys(validationErrors).some(k => ['title', 'price', 'propertyType'].includes(k)) ? 'border-[#E10600]' : 'border-neutral-400/30'}`}>
                    <h3 className="text-[#E10600] font-black mb-6 md:mb-8 uppercase tracking-widest text-[10px] md:text-xs flex items-center gap-4">
                        <span className="w-6 md:w-10 h-px bg-[#E10600]/20" />
                        Genel Bilgiler
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                        {initialData?.details?.listingId && (
                            <div className="md:col-span-2">
                                <label className="block text-[9px] md:text-[10px] font-black text-[#E10600] uppercase tracking-widest mb-1.5 md:mb-3">İlan No (Sistem Tarafından Verilen)</label>
                                <div className="w-full bg-white border border-[#E10600]/30 p-3 md:p-4 rounded-xl text-[#E10600] font-black text-sm md:text-base tracking-widest bg-white shadow-sm ring-1 ring-[#E10600]/10">
                                    {initialData.details.listingId}
                                </div>
                            </div>
                        )}
                        <div className="md:col-span-2">
                            <label className="block text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 md:mb-3">İlan Başlığı</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder=""
                                className={`w-full bg-neutral-100 border ${validationErrors.title ? 'border-[#E10600]' : 'border-neutral-400/30'} p-3 md:p-4 rounded-xl text-black outline-none focus:border-[#E10600] transition-all font-bold text-sm md:text-base`}
                            />
                            {validationErrors.title && (
                                <p className="text-[#E10600] text-xs font-bold mt-1.5 flex items-center gap-1">
                                    <AlertCircle size={12} /> {validationErrors.title}
                                </p>
                            )}
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 md:mb-3">Sahibinden İlan Linki (Opsiyonel)</label>
                            <input
                                type="text"
                                value={formData.sahibindenUrl || ""}
                                onChange={e => setFormData({ ...formData, sahibindenUrl: e.target.value })}
                                placeholder=""
                                className="w-full bg-neutral-100 border border-neutral-400/30 p-3 md:p-4 rounded-xl text-black outline-none focus:border-[#E10600] transition-all font-bold text-sm md:text-base"
                            />
                        </div>
                        <div>
                            <label className="block text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 md:mb-3">İlan Tipi</label>
                            <div className="flex gap-2 md:gap-4">
                                {["SATILIK", "KİRALIK"].map(t => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: t as any })}
                                        className={`flex-1 py-2 md:py-3 rounded-xl font-bold border transition-all text-xs md:text-sm ${formData.type === t ? "bg-[#E10600] border-[#E10600] text-white" : "bg-white border-neutral-400/30 text-neutral-400"}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 md:mb-3">Kategori</label>
                            <select
                                className="w-full bg-neutral-100 border border-neutral-400/30 p-3 md:p-4 rounded-xl text-black outline-none focus:border-[#E10600] transition-all font-bold text-sm md:text-base"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                            >
                                <option value="KONUT">Konut</option>
                                <option value="OFİS">Ofis</option>
                                <option value="ARSA">Arsa</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 md:mb-3">Danışman</label>
                            <select
                                className="w-full bg-neutral-100 border border-neutral-400/30 p-3 md:p-4 rounded-xl text-black outline-none focus:border-[#E10600] transition-all font-bold text-sm md:text-base"
                                value={formData.agentId}
                                onChange={e => setFormData({ ...formData, agentId: e.target.value })}
                            >
                                <option value="">Seçiniz...</option>
                                {agents.map(agent => (
                                    <option key={agent.id} value={agent.id}>{agent.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 md:mb-3">Fiyat (TL)</label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value === "" ? "" as any : Number(e.target.value) })}
                                className={`w-full bg-neutral-100 border ${validationErrors.price ? 'border-[#E10600]' : 'border-neutral-400/30'} p-3 md:p-4 rounded-xl text-black outline-none focus:border-[#E10600] transition-all font-bold text-sm md:text-base`}
                            />
                            {validationErrors.price && (
                                <p className="text-[#E10600] text-xs font-bold mt-1.5 flex items-center gap-1">
                                    <AlertCircle size={12} /> {validationErrors.price}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 md:mb-3">
                                {formData.category === "ARSA" ? "Arsa Tipi" : "Emlak Tipi"}
                            </label>
                            <input
                                type="text"
                                value={formData.details.propertyType}
                                onChange={e => setFormData({ ...formData, details: { ...formData.details, propertyType: e.target.value } })}
                                placeholder=""
                                className={`w-full bg-neutral-100 border ${validationErrors.propertyType ? 'border-[#E10600]' : 'border-neutral-400/30'} p-3 md:p-4 rounded-xl text-black outline-none focus:border-[#E10600] transition-all font-bold text-sm md:text-base`}
                            />
                            {validationErrors.propertyType && (
                                <p className="text-[#E10600] text-xs font-bold mt-1.5 flex items-center gap-1">
                                    <AlertCircle size={12} /> {validationErrors.propertyType}
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                {/* Location */}
                <section key="section-location" className={`${validationErrors.location ? 'validation-error-anchor' : ''} bg-white rounded-xl md:rounded-3xl px-4 py-5 md:p-10 shadow-sm border ${validationErrors.location ? 'border-[#E10600]' : 'border-neutral-400/30'}`}>
                    <h3 className="text-[#E10600] font-black mb-4 md:mb-8 uppercase tracking-widest text-[9px] md:text-xs flex items-center gap-4">
                        <span className="w-6 md:w-10 h-px bg-[#E10600]/20" />
                        Konum Bilgileri
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-6">
                        <div>
                            <label className="block text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 md:mb-2">Şehir</label>
                            <select
                                value={formData.location.city}
                                onChange={e => {
                                    const newCity = e.target.value;
                                    setFormData({
                                        ...formData,
                                        location: {
                                            ...formData.location,
                                            city: newCity,
                                            district: "",
                                            neighborhood: ""
                                        }
                                    });
                                    if (newCity) {
                                        flyToLocation(newCity);
                                    }
                                }}
                                className="w-full bg-neutral-100 border border-neutral-400/30 p-2.5 md:p-3 rounded-xl text-black outline-none focus:border-[#E10600] transition-all font-bold text-xs md:text-sm appearance-none"
                            >
                                <option value="">Şehir Seçin</option>
                                {CITIES.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 md:mb-2">İlçe</label>
                            <select
                                value={formData.location.district}
                                onChange={e => {
                                    const newDistrict = e.target.value;
                                    setFormData({
                                        ...formData,
                                        location: {
                                            ...formData.location,
                                            district: newDistrict,
                                            neighborhood: "" // Reset neighborhood when district changes
                                        }
                                    });
                                    if (newDistrict) {
                                        flyToLocation(newDistrict);
                                    }
                                }}
                                disabled={!formData.location.city}
                                className="w-full bg-neutral-100 border border-neutral-400/30 p-2.5 md:p-3 rounded-xl text-black outline-none focus:border-[#E10600] transition-all font-bold text-xs md:text-sm appearance-none disabled:opacity-50"
                            >
                                <option value="">İlçe Seçin</option>
                                {formData.location.city && CITY_LOCATIONS[formData.location.city] && Object.keys(CITY_LOCATIONS[formData.location.city]).sort().map(district => (
                                    <option key={district} value={district}>{district}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 md:mb-2">Mahalle</label>
                            <select
                                value={formData.location.neighborhood}
                                onChange={e => {
                                    const newNeighborhood = e.target.value;
                                    setFormData({ ...formData, location: { ...formData.location, neighborhood: newNeighborhood } });
                                    if (newNeighborhood) {
                                        flyToLocation(newNeighborhood, formData.location.district, true);
                                    }
                                }}
                                disabled={!formData.location.district}
                                className="w-full bg-neutral-100 border border-neutral-400/30 p-2.5 md:p-3 rounded-xl text-black outline-none focus:border-[#E10600] transition-all font-bold text-xs md:text-sm appearance-none disabled:opacity-50"
                            >
                                <option value="">Mahalle Seçin</option>
                                {formData.location.district && CITY_LOCATIONS[formData.location.city]?.[formData.location.district]?.sort().map(neighborhood => (
                                    <option key={neighborhood} value={neighborhood}>{neighborhood}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-3">
                            <label className="block text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 md:mb-3">Tam Adres</label>
                            <textarea
                                value={formData.location.fullAddress}
                                onChange={e => setFormData({ ...formData, location: { ...formData.location, fullAddress: e.target.value } })}
                                className={`w-full bg-neutral-100 border ${validationErrors.location ? 'border-[#E10600]' : 'border-neutral-400/30'} p-3 md:p-4 rounded-xl text-black outline-none focus:border-[#E10600] transition-all font-bold text-xs md:text-sm min-h-[100px]`}
                                placeholder=""
                            />
                            {validationErrors.location && (
                                <p className="text-[#E10600] text-xs font-bold mt-1.5 flex items-center gap-1">
                                    <AlertCircle size={12} /> {validationErrors.location}
                                </p>
                            )}
                        </div>
                        <div className="md:col-span-3">
                            <label className="block text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 md:mb-4">Harita Konumu (Tıklayarak Seçin)</label>
                            <MapPicker
                                lat={formData.location.map?.lat}
                                lng={formData.location.map?.lng}
                                onChange={(lat, lng) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        location: {
                                            ...prev.location,
                                            map: { lat, lng }
                                        }
                                    }));
                                }}
                                centerOn={mapCenter}
                            />
                        </div>
                    </div>
                </section>

                {/* Setup Specs Error Anchor if any */}
                <section key="section-specs" className={`${validationErrors.specs ? 'validation-error-anchor' : ''} bg-white rounded-xl md:rounded-3xl px-4 py-5 md:p-10 shadow-sm border ${validationErrors.specs ? 'border-[#E10600]' : 'border-neutral-400/30'}`}>
                    <h3 className="text-[#E10600] font-black mb-4 md:mb-8 uppercase tracking-widest text-[9px] md:text-xs flex items-center gap-4">
                        <span className="w-6 md:w-10 h-px bg-[#E10600]/20" />
                        İlan Detayları ({formData.category})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                        {/* Validation message for specs group (shows below grid) handled manually, or top of grid */}
                        {validationErrors.specs && (
                            <div className="col-span-full mb-2 p-3 bg-red-50/50 rounded-lg border border-red-200 text-red-600 text-xs font-bold flex items-center gap-2">
                                <AlertCircle size={14} /> {validationErrors.specs}
                            </div>
                        )}
                        {/* Common Fields */}
                        {/* Removed İlan No Field */}
                        <div>
                            <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">Metre Kare (m²)</label>
                            <input
                                type="number"
                                min="0"
                                value={formData.details.grossM2}
                                onChange={e => setFormData({ 
                                    ...formData, 
                                    details: { 
                                        ...formData.details, 
                                        grossM2: e.target.value,
                                        netM2: e.target.value // Keep in sync for safety during editing
                                    } 
                                })}
                                className="w-full bg-neutral-100 border border-neutral-400/30 p-3 rounded-lg text-black outline-none focus:border-[#E10600] transition-all font-bold text-sm"
                            />
                        </div>

                        {formData.category === "ARSA" ? (
                            <>
                                {/* Arsa Specific Fields */}
                                <div>
                                    <label className="block text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 md:mb-2">İmar Durumu</label>
                                    <input
                                        type="text"
                                        value={formData.details.zoningStatus || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, zoningStatus: e.target.value } })}
                                        placeholder=""
                                        className="w-full bg-neutral-100 border border-neutral-400/30 p-2.5 md:p-3 rounded-xl text-black outline-none focus:border-[#E10600] transition-all font-bold text-xs md:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 md:mb-2">Ada No</label>
                                    <input
                                        type="text"
                                        value={formData.details.islandNo || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, islandNo: e.target.value } })}
                                        className="w-full bg-neutral-100 border border-neutral-400/30 p-2.5 md:p-3 rounded-xl text-black outline-none focus:border-[#E10600] transition-all font-bold text-xs md:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 md:mb-2">Parsel No</label>
                                    <input
                                        type="text"
                                        value={formData.details.parcelNo || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, parcelNo: e.target.value } })}
                                        className="w-full bg-neutral-100 border border-neutral-400/30 p-2.5 md:p-3 rounded-xl text-black outline-none focus:border-[#E10600] transition-all font-bold text-xs md:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 md:mb-2">Pafta No</label>
                                    <input
                                        type="text"
                                        value={formData.details.paftaNo || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, paftaNo: e.target.value } })}
                                        className="w-full bg-neutral-100 border border-neutral-400/30 p-2.5 md:p-3 rounded-xl text-black outline-none focus:border-[#E10600] transition-all font-bold text-xs md:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 md:mb-2">Kaks (Emsal)</label>
                                    <input
                                        type="text"
                                        value={formData.details.kaks || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, kaks: e.target.value } })}
                                        className="w-full bg-neutral-100 border border-neutral-400/30 p-2.5 md:p-3 rounded-xl text-black outline-none focus:border-[#E10600] transition-all font-bold text-xs md:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 md:mb-2">Gabari</label>
                                    <input
                                        type="text"
                                        value={formData.details.gabari || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, gabari: e.target.value } })}
                                        className="w-full bg-neutral-100 border border-neutral-400/30 p-2.5 md:p-3 rounded-xl text-black outline-none focus:border-[#E10600] transition-all font-bold text-xs md:text-sm"
                                    />
                                </div>
                            </>
                        ) : formData.category === "OFİS" ? (
                            <>
                                {/* Office Specific Fields */}
                                <div>
                                    <label className="block text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 md:mb-2">Ofis Tipi</label>
                                    <input
                                        type="text"
                                        value={formData.details.propertyType || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, propertyType: e.target.value } })}
                                        placeholder=""
                                        className="w-full bg-neutral-100 border border-neutral-400/30 p-2.5 md:p-3 rounded-xl text-black outline-none focus:border-[#E10600] transition-all font-bold text-xs md:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 md:mb-2">Oda Sayısı</label>
                                    <input
                                        type="text"
                                        value={formData.details.roomCount || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, roomCount: e.target.value } })}
                                        className="w-full bg-neutral-100 border border-neutral-400/30 p-2.5 md:p-3 rounded-xl text-black outline-none focus:border-[#E10600] transition-all font-bold text-xs md:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 md:mb-2">Bina Yaşı</label>
                                    <input
                                        type="text"
                                        value={formData.details.buildingAge || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, buildingAge: e.target.value } })}
                                        className="w-full bg-neutral-100 border border-neutral-400/30 p-2.5 md:p-3 rounded-xl text-black outline-none focus:border-[#E10600] transition-all font-bold text-xs md:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 md:mb-2">Isıtma</label>
                                    <input
                                        type="text"
                                        value={formData.details.heating || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, heating: e.target.value } })}
                                        className="w-full bg-neutral-100 border border-neutral-400/30 p-2.5 md:p-3 rounded-xl text-black outline-none focus:border-[#E10600] transition-all font-bold text-xs md:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 md:mb-2">Bulunduğu Kat</label>
                                    <input
                                        type="text"
                                        value={formData.details.floorLevel || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, floorLevel: e.target.value } })}
                                        className="w-full bg-neutral-100 border border-neutral-400/30 p-2.5 md:p-3 rounded-xl text-black outline-none focus:border-[#E10600] transition-all font-bold text-xs md:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 md:mb-2">Kiracılı</label>
                                    <select
                                        value={formData.details.tenant || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, tenant: e.target.value } })}
                                        className="w-full bg-neutral-100 border border-neutral-400/30 p-2.5 md:p-3 rounded-xl text-black outline-none focus:border-[#E10600] transition-all font-bold text-xs md:text-sm appearance-none"
                                    >
                                        <option value="">Belirtilmemiş</option>
                                        <option value="Evet">Evet</option>
                                        <option value="Hayır">Hayır</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 md:mb-2">Bina Durumu</label>
                                    <select
                                        value={formData.details.condition || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, condition: e.target.value } })}
                                        className="w-full bg-neutral-100 border border-neutral-400/30 p-2.5 md:p-3 rounded-xl text-black outline-none focus:border-[#E10600] transition-all font-bold text-xs md:text-sm appearance-none"
                                    >
                                        <option value="">Belirtilmemiş</option>
                                        <option value="Sıfır">Sıfır</option>
                                        <option value="İkinci El">İkinci El</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 md:mb-2">Aidat (TL)</label>
                                    <input
                                        type="text"
                                        value={formData.details.dues || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, dues: e.target.value } })}
                                        className="w-full bg-neutral-100 border border-neutral-400/30 p-2.5 md:p-3 rounded-xl text-black outline-none focus:border-[#E10600] transition-all font-bold text-xs md:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 md:mb-2">Kat Sayısı</label>
                                    <input
                                        type="text"
                                        value={formData.details.totalFloors || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, totalFloors: e.target.value } })}
                                        className="w-full bg-neutral-100 border border-neutral-400/30 p-2.5 md:p-3 rounded-xl text-black outline-none focus:border-[#E10600] transition-all font-bold text-xs md:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 md:mb-2">Otopark</label>
                                    <input
                                        type="text"
                                        value={formData.details.parking || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, parking: e.target.value } })}
                                        placeholder="Açık, Kapalı, Yok vb."
                                        className="w-full bg-neutral-100 border border-neutral-400/30 p-2.5 md:p-3 rounded-xl text-black outline-none focus:border-[#E10600] transition-all font-bold text-xs md:text-sm"
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Residential Specific Fields */}
                                <div>
                                    <label className="block text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 md:mb-2">Oda Sayısı</label>
                                    <input
                                        type="text"
                                        value={formData.details.roomCount || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, roomCount: e.target.value } })}
                                        placeholder="2+1, 3+1 vb."
                                        className="w-full bg-neutral-100 border border-neutral-400/30 p-2.5 md:p-3 rounded-xl text-black outline-none focus:border-[#E10600] transition-all font-bold text-xs md:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 md:mb-2">Bina Yaşı</label>
                                    <input
                                        type="text"
                                        value={formData.details.buildingAge || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, buildingAge: e.target.value } })}
                                        className="w-full bg-neutral-100 border border-neutral-400/30 p-2.5 md:p-3 rounded-xl text-black outline-none focus:border-[#E10600] transition-all font-bold text-xs md:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 md:mb-2">Kat</label>
                                    <input
                                        type="text"
                                        value={formData.details.floorLevel || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, floorLevel: e.target.value } })}
                                        className="w-full bg-neutral-100 border border-neutral-400/30 p-2.5 md:p-3 rounded-xl text-black outline-none focus:border-[#E10600] transition-all font-bold text-xs md:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 md:mb-2">Kat Sayısı</label>
                                    <input
                                        type="text"
                                        value={formData.details.totalFloors || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, totalFloors: e.target.value } })}
                                        className="w-full bg-neutral-100 border border-neutral-400/30 p-2.5 md:p-3 rounded-xl text-black outline-none focus:border-[#E10600] transition-all font-bold text-xs md:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 md:mb-2">Isıtma</label>
                                    <input
                                        type="text"
                                        value={formData.details.heating || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, heating: e.target.value } })}
                                        className="w-full bg-neutral-100 border border-neutral-400/30 p-2.5 md:p-3 rounded-xl text-black outline-none focus:border-[#E10600] transition-all font-bold text-xs md:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 md:mb-2">Banyo Sayısı</label>
                                    <input
                                        type="text"
                                        value={formData.details.bathroomCount || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, bathroomCount: e.target.value } })}
                                        className="w-full bg-neutral-100 border border-neutral-400/30 p-2.5 md:p-3 rounded-xl text-black outline-none focus:border-[#E10600] transition-all font-bold text-xs md:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 md:mb-2">Mutfak</label>
                                    <input
                                        type="text"
                                        value={formData.details.kitchen || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, kitchen: e.target.value } })}
                                        placeholder="Kör, Açık vb."
                                        className="w-full bg-neutral-100 border border-neutral-400/30 p-2.5 md:p-3 rounded-xl text-black outline-none focus:border-[#E10600] transition-all font-bold text-xs md:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 md:mb-2">Otopark</label>
                                    <input
                                        type="text"
                                        value={formData.details.parking || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, parking: e.target.value } })}
                                        placeholder="Açık, Kapalı, Yok vb."
                                        className="w-full bg-neutral-100 border border-neutral-400/30 p-2.5 md:p-3 rounded-xl text-black outline-none focus:border-[#E10600] transition-all font-bold text-xs md:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 md:mb-2">Site Adı</label>
                                    <input
                                        type="text"
                                        value={formData.details.siteName || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, siteName: e.target.value } })}
                                        className="w-full bg-neutral-100 border border-neutral-400/30 p-2.5 md:p-3 rounded-xl text-black outline-none focus:border-[#E10600] transition-all font-bold text-xs md:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 md:mb-2">Aidat (TL)</label>
                                    <input
                                        type="text"
                                        value={formData.details.dues || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, dues: e.target.value } })}
                                        className="w-full bg-neutral-100 border border-neutral-400/30 p-2.5 md:p-3 rounded-xl text-black outline-none focus:border-[#E10600] transition-all font-bold text-xs md:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 md:mb-2">Kullanım Durumu</label>
                                    <input
                                        type="text"
                                        value={formData.details.usageStatus || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, usageStatus: e.target.value } })}
                                        className="w-full bg-neutral-100 border border-neutral-400/30 p-2.5 md:p-3 rounded-xl text-black outline-none focus:border-[#E10600] transition-all font-bold text-xs md:text-sm"
                                    />
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 md:mb-2">Tapu Durumu</label>
                            <input
                                type="text"
                                value={formData.details.titleDeedStatus}
                                onChange={e => setFormData({ ...formData, details: { ...formData.details, titleDeedStatus: e.target.value } })}
                                className="w-full bg-neutral-100 border border-neutral-400/30 p-2.5 md:p-3 rounded-xl text-black outline-none focus:border-[#E10600] transition-all font-bold text-xs md:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 md:mb-2">Kimden</label>
                            <input
                                type="text"
                                value={formData.details.from}
                                onChange={e => setFormData({ ...formData, details: { ...formData.details, from: e.target.value } })}
                                className="w-full bg-neutral-100 border border-neutral-400/30 p-2.5 md:p-3 rounded-xl text-black outline-none focus:border-[#E10600] transition-all font-bold text-xs md:text-sm"
                            />
                        </div>
                    </div>

                    {formData.category !== "ARSA" && (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mt-4 md:mt-8 px-1">
                            {[
                                { label: "Balkon", key: "balcony" },
                                { label: "Asansör", key: "elevator" },
                                { label: "Eşyalı", key: "furnished" },
                                { label: "Site İçinde", key: "withinSite" },
                            ].map((spec) => (
                                <div key={spec.key} className="flex items-center gap-2 md:gap-3">
                                    <input
                                        type="checkbox"
                                        checked={(formData.details as any)[spec.key]}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, [spec.key]: e.target.checked } })}
                                        className="w-4 h-4 md:w-5 md:h-5 accent-[#E10600]"
                                    />
                                    <label className="text-[9px] md:text-[10px] font-black text-black uppercase tracking-widest">{spec.label}</label>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mt-3 md:mt-4 px-1">
                        {[
                            { label: "Krediye Uygun", key: "creditEligible" },
                            { label: "Takas", key: "exchange" }
                        ].map((spec) => (
                            <div key={spec.key} className="flex items-center gap-2 md:gap-3">
                                <input
                                    type="checkbox"
                                    checked={(formData.details as any)[spec.key]}
                                    onChange={e => setFormData({ ...formData, details: { ...formData.details, [spec.key]: e.target.checked } })}
                                    className="w-4 h-4 md:w-5 md:h-5 accent-[#E10600]"
                                />
                                <label className="text-[9px] md:text-[10px] font-black text-black uppercase tracking-widest">{spec.label}</label>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Features Checklists */}
                <section key="section-features" className="bg-white rounded-xl md:rounded-3xl px-3 py-4 md:p-10 shadow-sm border border-neutral-400/30">
                    <h3 className="text-[#E10600] font-black mb-4 md:mb-8 uppercase tracking-widest text-[9px] md:text-xs flex items-center gap-4">
                        <span className="w-6 md:w-10 h-px bg-[#E10600]/20" />
                        Özellikler
                    </h3>
                    <div className="space-y-4 md:space-y-10">
                        {featureCategories.map((cat) => (
                            <div key={cat.id}>
                                <h4 className="text-[9px] md:text-[11px] font-black text-black uppercase mb-2 md:mb-4 tracking-widest">{cat.label}</h4>
                                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1 md:gap-3">
                                    {cat.options.map((opt) => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => handleFeatureToggle(cat.id, opt)}
                                            className={`text-[8px] md:text-[9px] p-1 md:p-2 rounded-lg border text-left font-bold transition-all ${formData.features[cat.id].includes(opt)
                                                ? "bg-[#E10600] border-[#E10600] text-white shadow-lg shadow-[#E10600]/20"
                                                : "bg-white border-neutral-400/30 text-neutral-400 hover:border-[#E10600]/40"
                                                }`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {currentCropImage && (
                    <ImageCropper
                        image={currentCropImage}
                        aspect={4 / 3}
                        queueCount={cropQueue.length}
                        onCropComplete={handleCropComplete}
                        onCancel={handleCropCancel}
                    />
                )}

                {/* Removed bottom big validation box */}

                {/* Floating Save Button */}
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="fixed bottom-20 right-6 md:bottom-24 md:right-10 z-[60] premium-button flex items-center gap-2 px-5 md:px-8 py-3 md:py-4 shadow-2xl shadow-[#E10600]/30 disabled:opacity-50 text-xs md:text-sm font-black tracking-widest rounded-full hover:scale-105 transition-transform"
                >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    {loading ? "KAYDEDİLİYOR..." : "KAYDET"}
                </button>
            </div>
        </div>
    );
}
