/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}",
	],
	prefix: "",
	theme: {
    	container: {
    		center: true,
    		padding: '2rem',
    		screens: {
    			'2xl': '1400px'
    		}
    	},
    	extend: {
    		colors: {
    			border: 'hsl(var(--border))',
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    			primary: {
    				'50': '#eff6ff',
    				'100': '#dbeafe',
    				'200': '#bfdbfe',
    				'300': '#93c5fd',
    				'400': '#60a5fa',
    				'500': '#3b82f6',
    				'600': '#2563eb',
    				'700': '#1d4ed8',
    				'800': '#1e40af',
    				'900': '#1e3a8a',
    				'950': '#172554',
    				DEFAULT: '#3b82f6',
    				foreground: '#ffffff'
    			},
    			secondary: {
    				'50': '#f8fafc',
    				'100': '#f1f5f9',
    				'200': '#e2e8f0',
    				'300': '#cbd5e1',
    				'400': '#94a3b8',
    				'500': '#64748b',
    				'600': '#475569',
    				'700': '#334155',
    				'800': '#1e293b',
    				'900': '#0f172a',
    				'950': '#020617',
    				DEFAULT: '#64748b',
    				foreground: '#ffffff'
    			},
    			destructive: {
    				DEFAULT: '#ef4444',
    				foreground: '#ffffff'
    			},
    			muted: {
    				DEFAULT: '#f1f5f9',
    				foreground: '#64748b'
    			},
    			accent: {
    				DEFAULT: '#f1f5f9',
    				foreground: '#0f172a'
    			},
    			popover: {
    				DEFAULT: '#ffffff',
    				foreground: '#0f172a'
    			},
    			card: {
    				DEFAULT: '#ffffff',
    				foreground: '#0f172a'
    			},
    			sidebar: {
    				DEFAULT: '#f8fafc',
    				foreground: '#0f172a',
    				primary: '#3b82f6',
    				'primary-foreground': '#ffffff',
    				accent: '#f1f5f9',
    				'accent-foreground': '#0f172a',
    				border: '#e2e8f0',
    				ring: '#3b82f6'
    			}
    		},
    		fontFamily: {
    			display: [
    				'Rajdhani',
    				'system-ui',
    				'sans-serif'
    			],
    			sans: [
    				'Inter',
    				'ui-sans-serif',
    				'system-ui',
    				'sans-serif'
    			],
    			altDisplay: [
    				'Montserrat',
    				'system-ui',
    				'sans-serif'
    			],
    			altSans: [
    				'Source Sans 3',
    				'system-ui',
    				'sans-serif'
    			]
    		},
    		borderRadius: {
    			lg: '0.5rem',
    			md: '0.375rem',
    			sm: '0.25rem'
    		},
    		keyframes: {
    			'accordion-down': {
    				from: {
    					height: '0',
    					opacity: '0'
    				},
    				to: {
    					height: 'var(--radix-accordion-content-height)',
    					opacity: '1'
    				}
    			},
    			'accordion-up': {
    				from: {
    					height: 'var(--radix-accordion-content-height)',
    					opacity: '1'
    				},
    				to: {
    					height: '0',
    					opacity: '0'
    				}
    			},
    			'fade-in': {
    				'0%': {
    					opacity: '0',
    					transform: 'translateY(10px)'
    				},
    				'100%': {
    					opacity: '1',
    					transform: 'translateY(0)'
    				}
    			},
    			'fade-out': {
    				'0%': {
    					opacity: '1',
    					transform: 'translateY(0)'
    				},
    				'100%': {
    					opacity: '0',
    					transform: 'translateY(10px)'
    				}
    			},
    			'scale-in': {
    				'0%': {
    					transform: 'scale(0.95)',
    					opacity: '0'
    				},
    				'100%': {
    					transform: 'scale(1)',
    					opacity: '1'
    				}
    			},
    			'scale-out': {
    				from: {
    					transform: 'scale(1)',
    					opacity: '1'
    				},
    				to: {
    					transform: 'scale(0.95)',
    					opacity: '0'
    				}
    			},
    			'slide-in-right': {
    				'0%': {
    					transform: 'translateX(100%)'
    				},
    				'100%': {
    					transform: 'translateX(0)'
    				}
    			},
    			'slide-out-right': {
    				'0%': {
    					transform: 'translateX(0)'
    				},
    				'100%': {
    					transform: 'translateX(100%)'
    				}
    			}
    		},
    		animation: {
    			'accordion-down': 'accordion-down 0.2s ease-out',
    			'accordion-up': 'accordion-up 0.2s ease-out',
    			'fade-in': 'fade-in 0.3s ease-out',
    			'fade-out': 'fade-out 0.3s ease-out',
    			'scale-in': 'scale-in 0.2s ease-out',
    			'scale-out': 'scale-out 0.2s ease-out',
    			'slide-in-right': 'slide-in-right 0.3s ease-out',
    			'slide-out-right': 'slide-out-right 0.3s ease-out',
    			enter: 'fade-in 0.3s ease-out, scale-in 0.2s ease-out',
    			exit: 'fade-out 0.3s ease-out, scale-out 0.2s ease-out'
    		}
    	}
    },
	plugins: [require("tailwindcss-animate")],
}
