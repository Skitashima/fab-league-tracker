/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./*.{js,ts,jsx,tsx}", // Matches files in root like App.tsx, index.tsx, but not recursive
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
