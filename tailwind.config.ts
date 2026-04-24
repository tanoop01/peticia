import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Legacy utility aliases bound to CSS variables for theme support
        'bg-primary': 'var(--app-bg)',
        'bg-secondary': 'var(--app-panel)',
        'bg-tertiary': 'var(--app-bg-elevated)',

        'surface-card': 'var(--app-panel)',
        'surface-hover': 'var(--app-panel-2)',

        'border-subtle': 'var(--app-border)',
        'border-strong': 'var(--app-border-strong)',

        'text-primary': 'var(--app-text)',
        'text-secondary': 'var(--app-accent-2)',
        'text-muted': 'var(--app-text-muted)',
        
        // Vibrant Accent Colors
        accent: {
          DEFAULT: '#3B82F6',
          hover: '#2563EB',
          light: 'rgba(59, 130, 246, 0.15)',
          dark: '#1E3A8A',
        },
        
        // Status Colors
        success: {
          DEFAULT: '#10B981',
          hover: '#059669',
          light: 'rgba(16, 185, 129, 0.15)',
          dark: '#065F46',
        },
        
        warning: {
          DEFAULT: '#F59E0B',
          hover: '#D97706',
          light: 'rgba(245, 158, 11, 0.15)',
          dark: '#92400E',
        },
        
        error: {
          DEFAULT: '#EF4444',
          hover: '#DC2626',
          light: 'rgba(239, 68, 68, 0.15)',
          dark: '#991B1B',
        },
        
        info: {
          DEFAULT: '#06B6D4',
          hover: '#0891B2',
          light: 'rgba(6, 182, 212, 0.15)',
          dark: '#164E63',
        },
        
        // Legacy support (backward compatible)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // KAIRO Brand Colors - Enhanced
        kairo: {
          orange: "#FF6B35",
          blue: "#3B82F6",
          green: "#10B981",
          yellow: "#F59E0B",
          purple: "#8B5CF6",
          pink: "#EC4899",
        }
      },
      borderRadius: {
        lg: "12px",
        md: "8px",
        sm: "6px",
      },
      fontSize: {
        'xs': '0.75rem',      // 12px
        'sm': '0.875rem',     // 14px  
        'base': '1rem',       // 16px
        'lg': '1.125rem',     // 18px
        'xl': '1.25rem',      // 20px
        '2xl': '1.5rem',      // 24px
        '3xl': '1.875rem',    // 30px
        '4xl': '2.25rem',     // 36px
      },
      letterSpacing: {
        tight: '-0.025em',
        tighter: '-0.05em',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "slide-in-up": {
          from: {
            opacity: "0",
            transform: "translateY(20px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "slide-in-down": {
          from: {
            opacity: "0",
            transform: "translateY(-20px)",
          },
          to: {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "slide-in-left": {
          from: {
            opacity: "0",
            transform: "translateX(-20px)",
          },
          to: {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        "slide-in-right": {
          from: {
            opacity: "0",
            transform: "translateX(20px)",
          },
          to: {
            opacity: "1",
            transform: "translateX(0)",
          },
        },
        "scale-in": {
          from: {
            opacity: "0",
            transform: "scale(0.95)",
          },
          to: {
            opacity: "1",
            transform: "scale(1)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-out": "fade-out 0.2s ease-in",
        "slide-in-up": "slide-in-up 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        "slide-in-down": "slide-in-down 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        "slide-in-left": "slide-in-left 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        "slide-in-right": "slide-in-right 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        "scale-in": "scale-in 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
