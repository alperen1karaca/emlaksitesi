export interface Listing {
    id?: string;
    title: string;
    description: string;
    price: number;
    type: "SATILIK" | "KİRALIK";
    category: "KONUT" | "OFİS" | "ARSA";
    isFeatured?: boolean; // Reklam / Öne Çıkan
    featuredUntil?: any; // Expiration date for doping (Firestore Timestamp or Unix MS)
    createdAt?: any; // Firestore Timestamp

    // Location Info
    location: {
        city: string; // e.g. Sakarya
        district: string; // e.g. Karasu
        neighborhood: string; // e.g. Aziziye Mah.
        fullAddress: string;
        map?: {
            lat: number;
            lng: number;
        };
    };

    // Property Details (Sahibinden style)
    details: {
        listingId?: string; // İlan No
        propertyType: string; // Emlak Tipi (Daire, Villa, etc.)
        grossM2: string;
        netM2: string;

        // Dynamic Fields
        roomCount?: string; // e.g. 2+1
        buildingAge?: string;
        floorLevel?: string;
        totalFloors?: string;
        heating?: string;
        bathroomCount?: string;
        balcony?: boolean;
        elevator?: boolean;
        parking?: string;
        furnished?: boolean;
        usageStatus?: string;
        kitchen?: string; // Mutfak
        withinSite?: boolean;
        siteName?: string;
        dues?: string; // Aidat
        creditEligible: boolean;
        titleDeedStatus: string; // Tapu Durumu
        from: string; // Kimden
        exchange: boolean; // Takas

        tenant?: string; // Kiracılı
        condition?: string; // Durumu (Sıfır / İkinci El)
        zoningStatus?: string; // İmar Durumu
        islandNo?: string; // Ada No
        parcelNo?: string; // Parsel No
        paftaNo?: string; // Pafta No
        kaks?: string; // Kaks (Emsal)
        gabari?: string; // Gabari
    };

    // Features Checklist
    features: {
        interior: string[]; // İç Özellikler
        exterior: string[]; // Dış Özellikler
        neighborhood: string[]; // Muhit
        transportation: string[]; // Ulaşım
        landscape: string[]; // Manzara
        infrastructure: string[]; // Altyapı
        housingType: string[]; // Konut Tipi
        disabledFriendly: string[]; // Engelliye Uygun
        proximity: string[]; // Yakınlık
    };

    // Media
    images: string[]; // URLs from Firebase Storage
    videoUrl?: string;
    sahibindenUrl?: string;
    agentId?: string; // Linked Agent
    userId?: string; // ID of the user who submitted the listing
    status: "approved" | "pending" | "rejected";
}

export interface Agent {
    id?: string;
    name: string;
    title: string;
    phone: string;
    email: string;
    imageUrl?: string;
    createdAt?: any;
}

export interface HeroSlide {
    id?: string;
    imageUrl: string;
    videoUrl?: string;
    title?: string;
    subtitle?: string;
    order: number;
    duration?: number; // Slayt süresi (saniye)
    createdAt?: any;
}

export type ListingFeatureCategory = keyof Listing["features"];

export interface ContactMessage {
    id?: string;
    name: string;
    phone: string;
    message: string;
    createdAt: any;
    status: "NEW" | "READ" | "ARCHIVED";
}
