import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#EC3944", // Red
                    dark: "#D62F39",
                },
                secondary: {
                    DEFAULT: "#2D3447",
                    dark: "#1D2230",
                },
            },
            backgroundImage: {
                "glass-gradient": "linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))",
            },
        },
    },
    plugins: [],
};
export default config;
