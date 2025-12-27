/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        extend: {
            fontFamily: {
                mono: ['"Courier New"', 'Courier', 'monospace'],
            },
            colors: {
                accent: 'rgb(var(--accent))',
                'accent-light': 'rgb(var(--accent-light))',
                'accent-dark': 'rgb(var(--accent-dark))',
                'terminal-green': '#00f3ff', // Cyan Neon
                'terminal-red': '#00a8ff', // Deep Sky Blue
                'terminal-black': '#0a0a12', // Deep Space Blue
                'terminal-dark': '#050510',
                'terminal-header': '#00f3ff',
                'terminal-dim': 'rgba(0, 20, 40, 0.95)',
                'neon-blue': '#00f3ff',
                'deep-space': '#050510',
            },
            keyframes: {
                blink: {
                    '50%': { opacity: '0' },
                },
                'scroll-text': {
                    from: { transform: 'translateX(100%)' },
                    to: { transform: 'translateX(-100%)' },
                },
                'loading-crazy': {
                    '0%': { left: '0', width: '0' },
                    '50%': { left: '0', width: '100%' },
                    '100%': { left: '100%', width: '0' },
                },
                'global-flicker': {
                    '0%': { transform: 'scale(1.01) translate(2px, 0)', filter: 'hue-rotate(90deg) contrast(1.5)' },
                    '50%': { transform: 'scale(0.99) translate(-2px, 0)', filter: 'hue-rotate(0deg) contrast(1.2)' },
                    '100%': { transform: 'scale(1.02) translate(1px, 1px)', filter: 'hue-rotate(-90deg) contrast(1.8)' },
                },
                'world-shake': {
                    '0%': { transform: 'translate(0,0)' },
                    '25%': { transform: 'translate(1px, 2px)' },
                    '50%': { transform: 'translate(-2px, -1px)' },
                    '75%': { transform: 'translate(2px, -2px)' },
                    '100%': { transform: 'translate(-1px, 1px)' },
                },
            },
            animation: {
                blink: 'blink 0.5s infinite',
                'scroll-text': 'scroll-text 10s linear infinite',
                'loading-crazy': 'loading-crazy 2s infinite',
                'global-flicker': 'global-flicker 0.05s infinite',
                'world-shake': 'world-shake 0.1s infinite',
            },
        },
    },
    plugins: [],
};
