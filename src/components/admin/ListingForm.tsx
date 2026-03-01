import { useState, useEffect } from "react";
import { Save, Plus, Trash2, Loader2, X, User } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Listing, ListingFeatureCategory, Agent } from "@/types/listing";

interface ListingFormProps {
    initialData?: Listing;
    onSubmit: (data: Omit<Listing, "id" | "createdAt" | "images">, imageUrls: string[]) => Promise<void>;
    loading: boolean;
}

export default function ListingForm({ initialData, onSubmit, loading }: ListingFormProps) {
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>(initialData?.images || []);
    const [agents, setAgents] = useState<Agent[]>([]);

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
        sahibindenUrl: initialData?.sahibindenUrl || ""
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setImages(prev => [...prev, ...newFiles]);

            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...newPreviews]);
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
        await onSubmit(formData, allImages);
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
        infraCategory,
        {
            id: "exterior",
            label: "Kullanım Amacı",
            options: ["Konut", "Ticari", "Sanayi", "Tarım", "Turizm", "Bağ & Bahçe", "Villa", "Prefabrik Uygun"]
        },
        {
            id: "landscape",
            label: "Manzara & Konum",
            options: ["Deniz Manzaralı", "Göl Manzaralı", "Doğa Manzaralı", "Şehir Manzaralı", "Yola Cephe", "Köşe Parsel", "Ana Yola Yakın", "Toplu Taşımaya Yakın"]
        },
        {
            id: "proximity",
            label: "Yakınlık",
            options: ["Hastaneye Yakın", "Okula Yakın", "Markete Yakın", "Denize Sıfır", "Göl Kenarı", "Şehir Merkezinde"]
        },
        neighborhoodCategory,
        transportationCategory
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tighter mb-2 uppercase">{initialData ? "İlanı Düzenle" : "Yeni İlan Ekle"}</h1>
                    <p className="text-gray-400 font-medium">SS Gayrimenkul Portföy Yönetimi</p>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="premium-button flex items-center gap-3 px-12 py-4 shadow-xl shadow-primary/20 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    {loading ? "KAYDEDİLİYOR..." : "KAYDET"}
                </button>
            </div>

            <div className="space-y-10">
                {/* Basic Info */}
                <section className="bg-white rounded-3xl p-8 lg:p-10 shadow-sm border border-gray-100">
                    <h3 className="text-primary font-black mb-8 uppercase tracking-widest text-xs flex items-center gap-4">
                        <span className="w-10 h-px bg-primary/20" />
                        Genel Bilgiler
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">İlan Başlığı</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Örn: Serdivan'da Ultra Lüks 2+1..."
                                className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-secondary outline-none focus:border-primary transition-all font-bold"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Sahibinden İlan Linki (Opsiyonel)</label>
                            <input
                                type="text"
                                value={formData.sahibindenUrl || ""}
                                onChange={e => setFormData({ ...formData, sahibindenUrl: e.target.value })}
                                placeholder="https://www.sahibinden.com/ilan/..."
                                className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-secondary outline-none focus:border-primary transition-all font-bold"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">İlan Tipi</label>
                            <div className="flex gap-4">
                                {["SATILIK", "KİRALIK"].map(t => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: t as any })}
                                        className={`flex-1 py-3 rounded-xl font-bold border transition-all ${formData.type === t ? "bg-primary border-primary text-white" : "bg-white border-gray-100 text-gray-400"}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Kategori</label>
                            <select
                                className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-secondary outline-none focus:border-primary transition-all font-bold"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                            >
                                <option value="KONUT">Konut</option>
                                <option value="OFİS">Ofis</option>
                                <option value="ARSA">Arsa</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Danışman</label>
                            <select
                                className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-secondary outline-none focus:border-primary transition-all font-bold"
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
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Fiyat (TL)</label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value === "" ? "" as any : Number(e.target.value) })}
                                className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-secondary outline-none focus:border-primary transition-all font-bold"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                                {formData.category === "ARSA" ? "Arsa Tipi" : "Emlak Tipi"}
                            </label>
                            <input
                                type="text"
                                value={formData.details.propertyType}
                                onChange={e => setFormData({ ...formData, details: { ...formData.details, propertyType: e.target.value } })}
                                placeholder={formData.category === "ARSA" ? "İmarlı, Ticari, Bağ/Bahçe vb." : "Daire, Villa, Müstakil Ev, vb."}
                                className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-secondary outline-none focus:border-primary transition-all font-bold"
                            />
                        </div>
                    </div>
                </section>

                {/* Location */}
                <section className="bg-white rounded-3xl p-8 lg:p-10 shadow-sm border border-gray-100">
                    <h3 className="text-primary font-black mb-8 uppercase tracking-widest text-xs flex items-center gap-4">
                        <span className="w-10 h-px bg-primary/20" />
                        Konum Bilgileri
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">İlçe</label>
                            <input
                                type="text"
                                value={formData.location.district}
                                onChange={e => setFormData({ ...formData, location: { ...formData.location, district: e.target.value } })}
                                placeholder="Örn: Serdivan"
                                className="w-full bg-gray-50 border border-gray-100 p-3 rounded-lg text-secondary outline-none focus:border-primary transition-all font-bold text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Mahalle</label>
                            <input
                                type="text"
                                value={formData.location.neighborhood}
                                onChange={e => setFormData({ ...formData, location: { ...formData.location, neighborhood: e.target.value } })}
                                placeholder="Örn: Arabacıalanı Mah."
                                className="w-full bg-gray-50 border border-gray-100 p-3 rounded-lg text-secondary outline-none focus:border-primary transition-all font-bold text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Tam Adres</label>
                            <input
                                type="text"
                                value={formData.location.fullAddress}
                                onChange={e => setFormData({ ...formData, location: { ...formData.location, fullAddress: e.target.value } })}
                                className="w-full bg-gray-50 border border-gray-100 p-3 rounded-lg text-secondary outline-none focus:border-primary transition-all font-bold text-sm"
                            />
                        </div>
                    </div>
                </section>

                {/* Detailed Specs */}
                <section className="bg-white rounded-3xl p-8 lg:p-10 shadow-sm border border-gray-100">
                    <h3 className="text-primary font-black mb-8 uppercase tracking-widest text-xs flex items-center gap-4">
                        <span className="w-10 h-px bg-primary/20" />
                        İlan Detayları ({formData.category})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {/* Common Fields */}
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">İlan No</label>
                            <input
                                type="text"
                                value={formData.details.listingId || ""}
                                onChange={e => setFormData({ ...formData, details: { ...formData.details, listingId: e.target.value } })}
                                className="w-full bg-gray-50 border border-gray-100 p-3 rounded-lg text-secondary outline-none focus:border-primary transition-all font-bold text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">m² (Brüt)</label>
                            <input
                                type="text"
                                value={formData.details.grossM2}
                                onChange={e => setFormData({ ...formData, details: { ...formData.details, grossM2: e.target.value } })}
                                className="w-full bg-gray-50 border border-gray-100 p-3 rounded-lg text-secondary outline-none focus:border-primary transition-all font-bold text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">m² (Net)</label>
                            <input
                                type="text"
                                value={formData.details.netM2}
                                onChange={e => setFormData({ ...formData, details: { ...formData.details, netM2: e.target.value } })}
                                className="w-full bg-gray-50 border border-gray-100 p-3 rounded-lg text-secondary outline-none focus:border-primary transition-all font-bold text-sm"
                            />
                        </div>

                        {formData.category === "ARSA" ? (
                            <>
                                {/* Arsa Specific Fields */}
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">İmar Durumu</label>
                                    <input
                                        type="text"
                                        value={formData.details.zoningStatus || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, zoningStatus: e.target.value } })}
                                        placeholder="Örn: Konut İmarlı"
                                        className="w-full bg-gray-50 border border-gray-100 p-3 rounded-lg text-secondary outline-none focus:border-primary transition-all font-bold text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Ada No</label>
                                    <input
                                        type="text"
                                        value={formData.details.islandNo || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, islandNo: e.target.value } })}
                                        className="w-full bg-gray-50 border border-gray-100 p-3 rounded-lg text-secondary outline-none focus:border-primary transition-all font-bold text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Parsel No</label>
                                    <input
                                        type="text"
                                        value={formData.details.parcelNo || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, parcelNo: e.target.value } })}
                                        className="w-full bg-gray-50 border border-gray-100 p-3 rounded-lg text-secondary outline-none focus:border-primary transition-all font-bold text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Pafta No</label>
                                    <input
                                        type="text"
                                        value={formData.details.paftaNo || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, paftaNo: e.target.value } })}
                                        className="w-full bg-gray-50 border border-gray-100 p-3 rounded-lg text-secondary outline-none focus:border-primary transition-all font-bold text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Kaks (Emsal)</label>
                                    <input
                                        type="text"
                                        value={formData.details.kaks || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, kaks: e.target.value } })}
                                        className="w-full bg-gray-50 border border-gray-100 p-3 rounded-lg text-secondary outline-none focus:border-primary transition-all font-bold text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Gabari</label>
                                    <input
                                        type="text"
                                        value={formData.details.gabari || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, gabari: e.target.value } })}
                                        className="w-full bg-gray-50 border border-gray-100 p-3 rounded-lg text-secondary outline-none focus:border-primary transition-all font-bold text-sm"
                                    />
                                </div>
                            </>
                        ) : formData.category === "OFİS" ? (
                            <>
                                {/* Office Specific Fields */}
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Ofis Tipi</label>
                                    <input
                                        type="text"
                                        value={formData.details.propertyType || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, propertyType: e.target.value } })}
                                        placeholder="Büro, Ofis, Dükkan vb."
                                        className="w-full bg-gray-50 border border-gray-100 p-3 rounded-lg text-secondary outline-none focus:border-primary transition-all font-bold text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Oda Sayısı</label>
                                    <input
                                        type="text"
                                        value={formData.details.roomCount || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, roomCount: e.target.value } })}
                                        className="w-full bg-gray-50 border border-gray-100 p-3 rounded-lg text-secondary outline-none focus:border-primary transition-all font-bold text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Bina Yaşı</label>
                                    <input
                                        type="text"
                                        value={formData.details.buildingAge || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, buildingAge: e.target.value } })}
                                        className="w-full bg-gray-50 border border-gray-100 p-3 rounded-lg text-secondary outline-none focus:border-primary transition-all font-bold text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Isıtma</label>
                                    <input
                                        type="text"
                                        value={formData.details.heating || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, heating: e.target.value } })}
                                        className="w-full bg-gray-50 border border-gray-100 p-3 rounded-lg text-secondary outline-none focus:border-primary transition-all font-bold text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Bulunduğu Kat</label>
                                    <input
                                        type="text"
                                        value={formData.details.floorLevel || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, floorLevel: e.target.value } })}
                                        className="w-full bg-gray-50 border border-gray-100 p-3 rounded-lg text-secondary outline-none focus:border-primary transition-all font-bold text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Kiracılı</label>
                                    <select
                                        value={formData.details.tenant || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, tenant: e.target.value } })}
                                        className="w-full bg-gray-50 border border-gray-100 p-3 rounded-lg text-secondary outline-none focus:border-primary transition-all font-bold text-sm"
                                    >
                                        <option value="">Belirtilmemiş</option>
                                        <option value="Evet">Evet</option>
                                        <option value="Hayır">Hayır</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Bina Durumu</label>
                                    <select
                                        value={formData.details.condition || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, condition: e.target.value } })}
                                        className="w-full bg-gray-50 border border-gray-100 p-3 rounded-lg text-secondary outline-none focus:border-primary transition-all font-bold text-sm"
                                    >
                                        <option value="">Belirtilmemiş</option>
                                        <option value="Sıfır">Sıfır</option>
                                        <option value="İkinci El">İkinci El</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Aidat (TL)</label>
                                    <input
                                        type="text"
                                        value={formData.details.dues || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, dues: e.target.value } })}
                                        className="w-full bg-gray-50 border border-gray-100 p-3 rounded-lg text-secondary outline-none focus:border-primary transition-all font-bold text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Kat Sayısı</label>
                                    <input
                                        type="text"
                                        value={formData.details.totalFloors || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, totalFloors: e.target.value } })}
                                        className="w-full bg-gray-50 border border-gray-100 p-3 rounded-lg text-secondary outline-none focus:border-primary transition-all font-bold text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Otopark</label>
                                    <input
                                        type="text"
                                        value={formData.details.parking || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, parking: e.target.value } })}
                                        placeholder="Açık, Kapalı, Yok vb."
                                        className="w-full bg-gray-50 border border-gray-100 p-3 rounded-lg text-secondary outline-none focus:border-primary transition-all font-bold text-sm"
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Residential Specific Fields */}
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Oda Sayısı</label>
                                    <input
                                        type="text"
                                        value={formData.details.roomCount || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, roomCount: e.target.value } })}
                                        placeholder="2+1, 3+1 vb."
                                        className="w-full bg-gray-50 border border-gray-100 p-3 rounded-lg text-secondary outline-none focus:border-primary transition-all font-bold text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Bina Yaşı</label>
                                    <input
                                        type="text"
                                        value={formData.details.buildingAge || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, buildingAge: e.target.value } })}
                                        className="w-full bg-gray-50 border border-gray-100 p-3 rounded-lg text-secondary outline-none focus:border-primary transition-all font-bold text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Kat</label>
                                    <input
                                        type="text"
                                        value={formData.details.floorLevel || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, floorLevel: e.target.value } })}
                                        className="w-full bg-gray-50 border border-gray-100 p-3 rounded-lg text-secondary outline-none focus:border-primary transition-all font-bold text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Kat Sayısı</label>
                                    <input
                                        type="text"
                                        value={formData.details.totalFloors || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, totalFloors: e.target.value } })}
                                        className="w-full bg-gray-50 border border-gray-100 p-3 rounded-lg text-secondary outline-none focus:border-primary transition-all font-bold text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Isıtma</label>
                                    <input
                                        type="text"
                                        value={formData.details.heating || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, heating: e.target.value } })}
                                        className="w-full bg-gray-50 border border-gray-100 p-3 rounded-lg text-secondary outline-none focus:border-primary transition-all font-bold text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Banyo Sayısı</label>
                                    <input
                                        type="text"
                                        value={formData.details.bathroomCount || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, bathroomCount: e.target.value } })}
                                        className="w-full bg-gray-50 border border-gray-100 p-3 rounded-lg text-secondary outline-none focus:border-primary transition-all font-bold text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Mutfak</label>
                                    <input
                                        type="text"
                                        value={formData.details.kitchen || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, kitchen: e.target.value } })}
                                        placeholder="Kör, Açık vb."
                                        className="w-full bg-gray-50 border border-gray-100 p-3 rounded-lg text-secondary outline-none focus:border-primary transition-all font-bold text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Otopark</label>
                                    <input
                                        type="text"
                                        value={formData.details.parking || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, parking: e.target.value } })}
                                        placeholder="Açık, Kapalı, Yok vb."
                                        className="w-full bg-gray-50 border border-gray-100 p-3 rounded-lg text-secondary outline-none focus:border-primary transition-all font-bold text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Site Adı</label>
                                    <input
                                        type="text"
                                        value={formData.details.siteName || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, siteName: e.target.value } })}
                                        className="w-full bg-gray-50 border border-gray-100 p-3 rounded-lg text-secondary outline-none focus:border-primary transition-all font-bold text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Aidat (TL)</label>
                                    <input
                                        type="text"
                                        value={formData.details.dues || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, dues: e.target.value } })}
                                        className="w-full bg-gray-50 border border-gray-100 p-3 rounded-lg text-secondary outline-none focus:border-primary transition-all font-bold text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Kullanım Durumu</label>
                                    <input
                                        type="text"
                                        value={formData.details.usageStatus || ""}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, usageStatus: e.target.value } })}
                                        className="w-full bg-gray-50 border border-gray-100 p-3 rounded-lg text-secondary outline-none focus:border-primary transition-all font-bold text-sm"
                                    />
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Tapu Durumu</label>
                            <input
                                type="text"
                                value={formData.details.titleDeedStatus}
                                onChange={e => setFormData({ ...formData, details: { ...formData.details, titleDeedStatus: e.target.value } })}
                                className="w-full bg-gray-50 border border-gray-100 p-3 rounded-lg text-secondary outline-none focus:border-primary transition-all font-bold text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Kimden</label>
                            <input
                                type="text"
                                value={formData.details.from}
                                onChange={e => setFormData({ ...formData, details: { ...formData.details, from: e.target.value } })}
                                className="w-full bg-gray-50 border border-gray-100 p-3 rounded-lg text-secondary outline-none focus:border-primary transition-all font-bold text-sm"
                            />
                        </div>
                    </div>

                    {formData.category !== "ARSA" && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
                            {[
                                { label: "Balkon", key: "balcony" },
                                { label: "Asansör", key: "elevator" },
                                { label: "Eşyalı", key: "furnished" },
                                { label: "Site İçinde", key: "withinSite" },
                            ].map((spec) => (
                                <div key={spec.key} className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={(formData.details as any)[spec.key]}
                                        onChange={e => setFormData({ ...formData, details: { ...formData.details, [spec.key]: e.target.checked } })}
                                        className="w-5 h-5 accent-primary"
                                    />
                                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest">{spec.label}</label>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4">
                        {[
                            { label: "Krediye Uygun", key: "creditEligible" },
                            { label: "Takas", key: "exchange" }
                        ].map((spec) => (
                            <div key={spec.key} className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={(formData.details as any)[spec.key]}
                                    onChange={e => setFormData({ ...formData, details: { ...formData.details, [spec.key]: e.target.checked } })}
                                    className="w-5 h-5 accent-primary"
                                />
                                <label className="text-[10px] font-black text-secondary uppercase tracking-widest">{spec.label}</label>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Features Checklists */}
                <section className="bg-white rounded-3xl p-8 lg:p-10 shadow-sm border border-gray-100">
                    <h3 className="text-primary font-black mb-8 uppercase tracking-widest text-xs flex items-center gap-4">
                        <span className="w-10 h-px bg-primary/20" />
                        Özellikler
                    </h3>
                    <div className="space-y-10">
                        {featureCategories.map((cat) => (
                            <div key={cat.id}>
                                <h4 className="text-[11px] font-black text-secondary uppercase mb-4 tracking-widest">{cat.label}</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                    {cat.options.map((opt) => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => handleFeatureToggle(cat.id, opt)}
                                            className={`text-[10px] p-2 rounded-lg border text-left font-bold transition-all ${formData.features[cat.id].includes(opt)
                                                ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                                                : "bg-white border-gray-100 text-gray-400 hover:border-primary/40"
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

                {/* Images */}
                <section className="bg-white rounded-3xl p-8 lg:p-10 shadow-sm border border-gray-100">
                    <h3 className="text-primary font-black mb-8 uppercase tracking-widest text-xs flex items-center gap-4">
                        <span className="w-10 h-px bg-primary/20" />
                        Görseller
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                        {previews.map((src, i) => (
                            <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group border border-gray-100">
                                <img src={src} className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removePreview(i)}
                                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="text-white" size={24} />
                                </button>
                            </div>
                        ))}
                        <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 hover:border-primary/40 transition-colors cursor-pointer bg-gray-50 group">
                            <Plus className="text-gray-300 group-hover:text-primary" size={32} />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ekle</span>
                            <input type="file" multiple className="hidden" onChange={handleImageChange} accept="image/*" />
                        </label>
                    </div>
                </section>

                {/* Description */}
                <section className="bg-white rounded-3xl p-8 lg:p-10 shadow-sm border border-gray-100">
                    <h3 className="text-primary font-black mb-8 uppercase tracking-widest text-xs flex items-center gap-4">
                        <span className="w-10 h-px bg-primary/20" />
                        Açıklama
                    </h3>
                    <textarea
                        rows={8}
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        placeholder="İlan hakkında detaylı açıklama girin..."
                        className="w-full bg-gray-50 border border-gray-100 p-6 rounded-2xl text-secondary outline-none focus:border-primary transition-all font-medium leading-relaxed"
                    ></textarea>
                </section>
            </div>
        </div>
    );
}
