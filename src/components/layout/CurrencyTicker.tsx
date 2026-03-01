"use client";
import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

const INITIAL_DATA = [
    { label: "Dolar", value: 43.9459, trend: "up" },
    { label: "Euro", value: 52.0100, trend: "up" },
    { label: "Altın", value: 7411.99, trend: "up" },
    { label: "Bist", value: 13718, trend: "down" },
];

export default function CurrencyTicker() {
    const [data, setData] = useState(INITIAL_DATA);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);

        const interval = setInterval(() => {
            setData(prev => prev.map(item => {
                // Randomly fluctuate values slightly (simulate "live")
                const change = (Math.random() - 0.48) * (item.label === "Altın" ? 5 : 0.01);
                const newValue = item.value + change;
                return {
                    ...item,
                    value: newValue,
                    trend: change >= 0 ? "up" : "down"
                };
            }));
        }, 5000);

        return () => {
            clearInterval(interval);
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const formatValue = (val: number, label: string) => {
        if (label === "Bist") return Math.floor(val).toLocaleString("tr-TR");
        if (label === "Altın") return val.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return val.toLocaleString("tr-TR", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
    };

    return (
        <div className={`bg-white border-b border-gray-100 overflow-hidden whitespace-nowrap transition-all duration-500 ${isScrolled ? "h-0 opacity-0 border-none" : "h-[32px] py-1.5 opacity-100"}`}>
            <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-end md:gap-10 gap-4">
                {data.map((item, index) => (
                    <div key={index} className={`flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-500 ${index > 1 ? "hidden sm:flex" : "flex"}`}>
                        <span className="text-[10px] font-black text-secondary uppercase tracking-tighter">
                            {item.label}: <span className="text-secondary/60 font-bold">{formatValue(item.value, item.label)}</span>
                        </span>
                        {item.trend === "up" ? (
                            <TrendingUp size={10} className="text-green-500" />
                        ) : (
                            <TrendingDown size={10} className="text-red-500" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
