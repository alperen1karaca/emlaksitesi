"use client";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { ExternalLink } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet with Next.js
const shadowUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png";
const iconUrl = "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png";

const DefaultIcon = L.icon({
    iconUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapViewProps {
    lat: number;
    lng: number;
    title: string;
}

export default function MapView({ lat, lng, title }: MapViewProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [isSatellite, setIsSatellite] = useState(true);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return <div className="h-full w-full bg-neutral-100 animate-pulse" />;

    // Yalnızca Türkiye sınırları içerisinde gezinebilme (GüneyBatı, KuzeyDoğu)
    const turkeyBounds: L.LatLngBoundsExpression = [
        [35.8, 25.6],
        [42.1, 44.8]
    ];

    return (
        <div className="relative h-full w-full group">
            <MapContainer
                center={[lat, lng]}
                zoom={17}
                minZoom={5}
                maxBounds={turkeyBounds}
                maxBoundsViscosity={1.0}
                scrollWheelZoom={true}
                className="h-full w-full"
                zoomControl={true}
            >
                {isSatellite ? (
                    <TileLayer
                        attribution='&copy; <a href="http://mt0.google.com/">Google Haritalar</a>'
                        url="http://mt0.google.com/vt/lyrs=y&hl=tr&x={x}&y={y}&z={z}"
                        noWrap={true}
                    />
                ) : (
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                )}
                <Marker position={[lat, lng]}>
                    <Popup className="premium-popup">
                        <div className="font-bold text-black text-xs uppercase tracking-tight">{title}</div>
                    </Popup>
                </Marker>
            </MapContainer>

            {/* Layer Toggle Button */}
            <div className="absolute bottom-6 right-6 z-[1000] flex flex-col gap-3">
                <a
                    href={`https://www.google.com/maps?q=${lat},${lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white text-black px-4 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-neutral-100 transition-all shadow-2xl border border-neutral-400/30 flex items-center justify-center gap-2"
                >
                    <ExternalLink size={14} />
                    Google Haritalar'da Aç
                </a>
                <button
                    onClick={() => setIsSatellite(!isSatellite)}
                    className="bg-white/95 backdrop-blur-md text-black px-4 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-white transition-all shadow-2xl border border-neutral-400/30 flex items-center gap-2"
                >
                    {isSatellite ? 'Sokak Görünümü' : 'Uydu Görünümü'}
                </button>
            </div>
        </div>
    );
}
