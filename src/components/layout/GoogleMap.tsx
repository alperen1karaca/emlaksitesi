"use client";

import { MapPin, ExternalLink } from "lucide-react";

export default function GoogleMap() {
    return (
        <section className="relative w-full bg-white">
            {/* Header / Info Bar */}
            <div className="max-w-[1400px] mx-auto px-6 py-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                        <MapPin className="text-primary" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-secondary tracking-tight uppercase">Lokasyonumuz</h2>
                        <p className="text-secondary/60 text-sm font-medium">Ofisimize bir kahveye bekleriz.</p>
                    </div>
                </div>

                <a
                    href="https://www.google.com/maps/search/Doktor+Nuri+Bayar+Cd.+54,+54100+Sakarya,+Adapazarı+Türkiye"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary font-bold text-sm hover:underline group"
                >
                    Google Haritalar'da Aç
                    <ExternalLink size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
            </div>

            {/* Map Iframe Container */}
            <div className="w-full h-[300px] bg-gray-100 relative group overflow-hidden">
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3021.821!2d30.401!3d40.781!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14ccb2b!2sDoktor%20Nuri%20Bayar%20Cd.%2054%2C%2054100%20Adapazar%C4%B1%2FSakarya!5e0!3m2!1str!2str!4v1710000000000!5m2!1str!2str"
                    width="100%"
                    height="100%"
                    style={{ border: 0, filter: 'grayscale(0.2) contrast(1.1) brightness(1.05)' }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="SS Gayrimenkul Lokasyon"
                    className="grayscale hover:grayscale-0 transition-all duration-700 ease-in-out"
                />

                {/* Subtle Overlay to match site aesthetic */}
                <div className="absolute inset-0 pointer-events-none border-y border-white/10" />
            </div>
        </section>
    );
}
