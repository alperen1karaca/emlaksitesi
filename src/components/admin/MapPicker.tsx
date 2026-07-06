"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Polygon, ZoomControl } from "react-leaflet";
import L from "leaflet";
import { Map as MapIcon, Layers, Crosshair, Info, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---
interface MapPickerProps {
    lat?: number;
    lng?: number;
    onChange: (lat: number, lng: number) => void;
    centerOn?: { lat: number; lng: number; zoom?: number } | null;
}

// --- Components ---


// Harita Odaklama Yakalayıcı
function MapFlyHandler({ centerOn }: { centerOn: { lat: number, lng: number, zoom?: number } | null | undefined }) {
    const map = useMap();

    useEffect(() => {
        if (centerOn) {
            map.flyTo([centerOn.lat, centerOn.lng], centerOn.zoom || 18, {
                duration: 1.5,
                easeLinearity: 0.25
            });
        }
    }, [centerOn, map]);

    return null;
}

// Harita Boyutu Güncelleyici (Leaflet gri ekran hatasını çözer)
function MapInvalidator() {
    const map = useMap();
    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 250);
        return () => clearTimeout(timer);
    }, [map]);
    return null;
}

// Lokasyon İşleyici

function LocationHandler({
    lat,
    lng,
    onSelect
}: {
    lat?: number;
    lng?: number;
    onSelect: (lat: number, lng: number) => void;
}) {
    const map = useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            onSelect(lat, lng);
            map.flyTo([lat, lng], 18);
        },
    });

    return lat && lng ? (
        <Marker position={[lat, lng]} />
    ) : null;
}

export default function MapPicker({ lat, lng, onChange, centerOn }: MapPickerProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [isSatellite, setIsSatellite] = useState(true);

    useEffect(() => {
        setIsMounted(true);
        const shadowUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png";
        const iconUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png";
        const DefaultIcon = L.icon({
            iconUrl,
            shadowUrl,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
        });
        L.Marker.prototype.options.icon = DefaultIcon;
    }, []);

    if (!isMounted) return <div className="h-[600px] bg-gray-100 rounded-3xl animate-pulse" />;

    const initialPosition: [number, number] = lat && lng ? [lat, lng] : [39.0, 35.0];
    
    // Yalnızca Türkiye sınırları içerisinde gezinebilme (GüneyBatı, KuzeyDoğu)
    const turkeyBounds: L.LatLngBoundsExpression = [
        [35.8, 25.6],
        [42.1, 44.8]
    ];

    return (
        <div className="relative h-[600px] w-full rounded-3xl overflow-hidden border border-neutral-400/30 shadow-2xl group font-manrope">
            <MapContainer
                center={initialPosition}
                zoom={lat && lng ? 18 : 6}
                minZoom={5}
                maxBounds={turkeyBounds}
                maxBoundsViscosity={1.0}
                scrollWheelZoom={true}
                className="h-full w-full z-10"
                zoomControl={false}
            >
                {isSatellite ? (
                    <TileLayer
                        attribution='&copy; <a href="http://mt0.google.com/">Google Haritalar</a>'
                        url="http://mt0.google.com/vt/lyrs=y&hl=tr&x={x}&y={y}&z={z}"
                        noWrap={true}
                        bounds={[[-90, -180], [90, 180]]}
                    />
                ) : (
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        noWrap={true}
                        bounds={[[-90, -180], [90, 180]]}
                    />
                )}

                <ZoomControl position="bottomleft" />
                <MapInvalidator />

                <MapFlyHandler centerOn={centerOn} />

                <LocationHandler
                    lat={lat}
                    lng={lng}
                    onSelect={(la, ln) => onChange(la, ln)}
                />
            </MapContainer>

            <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-3">
                <button
                    onClick={() => setIsSatellite(!isSatellite)}
                    className="flex items-center gap-3 bg-white text-black px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-neutral-100 transition-all shadow-2xl"
                >
                    <Layers size={16} />
                    {isSatellite ? 'Sokak Görünümü' : 'Uydu Görünümü'}
                </button>
            </div>

            <div className="absolute bottom-4 right-4 z-[900] bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-[9px] font-black text-white/80 uppercase tracking-widest">
                {lat && lng ? `${lat.toFixed(6)}, ${lng.toFixed(6)}` : 'Konum Seçilmedi'}
            </div>
        </div>
    );
}
