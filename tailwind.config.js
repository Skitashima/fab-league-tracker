/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}", // Added components folder just in case
        "./**/*.{js,ts,jsx,tsx}", // Catch-all for root level files like App.tsx
    ],
    theme: {
        extend: {
            colors: {
                'fab-red': '#C23B22',
                'fab-dark': '#1a1a1a',
                'fab-gold': '#D4AF37',
                'fab-slate': '#2D3748',
            }
        },
    },
    plugins: [],
}
