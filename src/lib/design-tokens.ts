/**
 * Genç Sosyal Design Tokens — Production-Grade Design System Foundation
 * Centralized design tokens for colors, typography, radius, spacing, shadows, glassmorphism, and accessibility.
 * 
 * Complies with:
 * - Liquid Glass + Modern Soft UI specifications
 * - Strict light/dark contrast standards
 * - WCAG AA accessible interactive touch targets and focus rings
 */

export const tokens = {
  // 1. COLORS: Comprehensive Light & Dark System
  colors: {
    light: {
      canvas: '#F8FAFC',
      surfaceBase: '#FFFFFF',
      surfaceElevated: '#FFFFFF',
      surfaceSubtle: '#F1F5F9',
      surfaceGlass: 'rgba(255, 255, 255, 0.75)',
      borderSubtle: 'rgba(15, 23, 42, 0.06)',
      borderStrong: 'rgba(15, 23, 42, 0.12)',
      textPrimary: '#0F172A',
      textSecondary: '#334155',
      textMuted: '#64748B',
      textSubtle: '#94A3B8',
      brandPrimary: '#2563EB',
      brandSoft: '#EFF6FF',
      brandHover: '#1D4ED8',
      success: '#10B981',
      successSoft: '#ECFDF5',
      warning: '#F59E0B',
      warningSoft: '#FFFBEB',
      danger: '#EF4444',
      dangerSoft: '#FEF2F2',
      info: '#0284C7',
      infoSoft: '#F0F9FF',
    },
    dark: {
      canvas: '#070A10',
      surfaceBase: '#0D121D',
      surfaceElevated: '#131927',
      surfaceSubtle: '#161E2E',
      surfaceGlass: 'rgba(13, 18, 29, 0.75)',
      borderSubtle: 'rgba(255, 255, 255, 0.07)',
      borderStrong: 'rgba(255, 255, 255, 0.14)',
      textPrimary: '#F8FAFC',
      textSecondary: '#CBD5E1',
      textMuted: '#94A3B8',
      textSubtle: '#64748B',
      brandPrimary: '#3B82F6',
      brandSoft: 'rgba(59, 130, 246, 0.14)',
      brandHover: '#60A5FA',
      success: '#34D399',
      successSoft: 'rgba(16, 185, 129, 0.15)',
      warning: '#FBBF24',
      warningSoft: 'rgba(245, 158, 11, 0.15)',
      danger: '#F87171',
      dangerSoft: 'rgba(239, 68, 68, 0.15)',
      info: '#38BDF8',
      infoSoft: 'rgba(2, 132, 199, 0.15)',
    },

    // Semantic helper classes for Tailwind
    brand: {
      primary: 'blue-600',
      primaryHover: 'blue-700',
      primaryActive: 'blue-800',
      primaryLight: 'blue-50',
      primaryBorder: 'blue-200',
      secondary: 'indigo-600',
      secondaryHover: 'indigo-700',
      accent: 'blue-500',
      gradient: 'from-blue-600 to-indigo-600',
    },
    neutral: {
      canvas: 'bg-[#F8FAFC] dark:bg-[#070A10]',
      bg: 'bg-[#F8FAFC] dark:bg-[#070A10]',
      surface: 'bg-white dark:bg-[#0D121D]',
      surfaceElevated: 'bg-white dark:bg-[#131927]',
      surfaceMuted: 'bg-[#F1F5F9] dark:bg-[#161E2E]',
      border: 'border-slate-900/[0.08] dark:border-white/[0.08]',
      borderSubtle: 'border-slate-900/[0.06] dark:border-white/[0.07]',
      borderStrong: 'border-slate-900/[0.12] dark:border-white/[0.14]',
      textMain: 'text-[#0F172A] dark:text-[#F8FAFC]',
      textMuted: 'text-[#64748B] dark:text-[#94A3B8]',
      textSubtle: 'text-[#94A3B8] dark:text-[#64748B]',
      divider: 'bg-slate-900/[0.06] dark:bg-white/[0.07]',
    },
    feedback: {
      success: {
        bg: 'bg-emerald-50 dark:bg-emerald-950/30',
        border: 'border-emerald-200/80 dark:border-emerald-800/40',
        text: 'text-emerald-700 dark:text-emerald-300',
        solid: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white',
      },
      warning: {
        bg: 'bg-amber-50 dark:bg-amber-950/30',
        border: 'border-amber-200/80 dark:border-amber-800/40',
        text: 'text-amber-700 dark:text-amber-300',
        solid: 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white',
      },
      danger: {
        bg: 'bg-rose-50 dark:bg-rose-950/30',
        border: 'border-rose-200/80 dark:border-rose-800/40',
        text: 'text-rose-700 dark:text-rose-300',
        solid: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white',
      },
      info: {
        bg: 'bg-sky-50 dark:bg-sky-950/30',
        border: 'border-sky-200/80 dark:border-sky-800/40',
        text: 'text-sky-700 dark:text-sky-300',
        solid: 'bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white',
      },
    },
  },

  // 2. TYPOGRAPHY: Standardized Scale (400, 500, 600, 700 hierarchy — no aggressive black/extrabold)
  typography: {
    display: 'text-[32px] leading-[1.2] font-bold tracking-tight',
    h1: 'text-[24px] leading-[1.25] font-bold tracking-tight',
    h2: 'text-[20px] leading-[1.3] font-semibold tracking-tight',
    h3: 'text-[16px] leading-[1.4] font-semibold',
    bodyLarge: 'text-[16px] leading-[1.6] font-normal',
    body: 'text-[14px] leading-[1.5] font-normal',
    muted: 'text-[13px] leading-[1.5] font-normal text-slate-500 dark:text-slate-400',
    label: 'text-[14px] leading-[1.4] font-semibold',
    caption: 'text-[12px] leading-[1.4] font-medium',
  },

  // 3. RADIUS: xs(4px), sm(8px), md(12px), lg(16px), xl(20px), pill(9999px)
  radius: {
    none: 'rounded-none',
    xs: 'rounded',           // 4px
    sm: 'rounded-lg',        // 8px
    md: 'rounded-xl',        // 12px (Standard for Buttons, Inputs, Controls)
    lg: 'rounded-2xl',       // 16px (Standard for Cards, Surfaces)
    xl: 'rounded-[20px]',    // 20px (Modals, Large Cards, Drawers)
    pill: 'rounded-full',    // 9999px (Badges, Pills, Avatars)
    full: 'rounded-full',    // Backward compatibility
  },

  // 4. SPACING SCALE: 4, 8, 12, 16, 20, 24, 32, 48
  spacing: {
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    12: '48px',
  },

  // 5. ELEVATION / SHADOW: Natural light & subtle dark shadows without aggressive glow
  shadow: {
    none: 'shadow-none',
    xs: 'shadow-xs',
    sm: 'shadow-xs shadow-slate-900/[0.04] dark:shadow-none',
    md: 'shadow-sm shadow-slate-900/[0.06] dark:shadow-slate-950/40',
    lg: 'shadow-md shadow-slate-900/[0.08] dark:shadow-slate-950/60',
    xl: 'shadow-xl shadow-slate-900/[0.12] dark:shadow-slate-950/80',
    dropdown: 'shadow-lg shadow-slate-900/[0.08] dark:shadow-slate-950/60',
    modal: 'shadow-2xl shadow-slate-900/[0.18] dark:shadow-slate-950/90',
  },

  // 6. LIQUID GLASS: Controlled, high-performance glassmorphism for overlays and chrome
  glass: {
    chrome: 'backdrop-blur-md bg-white/75 dark:bg-[#0D121D]/75 border border-slate-900/[0.06] dark:border-white/[0.07] shadow-xs',
    elevated: 'backdrop-blur-lg bg-white/80 dark:bg-[#131927]/80 border border-slate-900/[0.08] dark:border-white/[0.10] shadow-md',
    dropdown: 'backdrop-blur-md bg-white/95 dark:bg-[#0D121D]/95 border border-slate-900/[0.08] dark:border-white/[0.10] shadow-lg',
    modal: 'backdrop-blur-xl bg-white/90 dark:bg-[#0D121D]/90 border border-slate-900/[0.10] dark:border-white/[0.12] shadow-2xl',
  },

  // 7. FOCUS RINGS: Accessible, clear brand rings for keyboard navigation
  focus: {
    ring: 'focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#070A10]',
    ringDanger: 'focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#070A10]',
    input: 'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white dark:focus:bg-[#131927] dark:focus:border-blue-500 dark:focus:ring-blue-500/30',
    inputError: 'focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 focus:bg-rose-50/20 dark:focus:border-rose-500 dark:focus:ring-rose-500/30',
    inputSuccess: 'focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white dark:focus:bg-[#131927] dark:focus:border-emerald-500 dark:focus:ring-emerald-500/30',
  },

  // 8. TRANSITIONS: Smooth, refined micro-interactions
  transitions: {
    fast: 'transition-all duration-150 ease-out',
    normal: 'transition-all duration-200 ease-out',
    smooth: 'transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1)',
    spring: 'transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  // 9. ACCESSIBLE TOUCH TARGETS: Minimum 44x44px for mobile interactions
  touch: {
    target: 'min-h-[44px] min-w-[44px]',
    iconTarget: 'min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px]',
  },

  // 10. Z-INDEX HIERARCHY
  zIndex: {
    dropdown: 'z-50',
    sticky: 'z-40',
    modal: 'z-50',
    popover: 'z-50',
    toast: 'z-[9999]',
    tooltip: 'z-[9999]',
  },
} as const;

export type DesignTokens = typeof tokens;
