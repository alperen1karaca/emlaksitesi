import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-roboto)", "sans-serif"],
                heading: ["var(--font-montserrat)", "sans-serif"],
                decorative: ["var(--font-playfair)", "serif"],
            },
            colors: {
                // Professional & Modern Real Estate Palette
                background: "#F5F5F5", // Light Gray Background
                surface: "#FFFFFF",    // Clean White Cards
                foreground: "#2B2B2B", // Dark Gray Text
                muted: "#A0A0A0",      // Medium Gray Text/Borders
                border: "#E0E0E0",
                primary: {
                    DEFAULT: "#E10600", // Brand Red (CTAs/Highlights)
                    dark: "#C00500",
                },
                secondary: {
                    DEFAULT: "#000000", // Pure Black Structure
                    dark: "#000000",
                },
                accent: {
                    DEFAULT: "#FFC700", // Gold Highlights
                }
            },
            backgroundImage: {
                "glass-gradient": "linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.8))",
            },
        },
    },
    plugins: [],
};
export default config;
