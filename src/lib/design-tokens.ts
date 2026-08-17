/**
 * Genç Sosyal Design Tokens
 * Global design system tokens for consistent typography, colors, borders, shadows, spacing and transitions.
 */

export const tokens = {
  colors: {
    brand: {
      primary: 'indigo-600',
      primaryHover: 'indigo-700',
      primaryActive: 'indigo-800',
      primaryLight: 'indigo-50',
      primaryBorder: 'indigo-200',
      secondary: 'violet-600',
      secondaryHover: 'violet-700',
      accent: 'blue-500',
      gradient: 'from-indigo-600 to-violet-600',
    },
    neutral: {
      bg: 'bg-slate-50',
      surface: 'bg-white',
      surfaceMuted: 'bg-slate-50/80',
      border: 'border-slate-200/80',
      borderSubtle: 'border-slate-100',
      textMain: 'text-slate-900',
      textMuted: 'text-slate-600',
      textSubtle: 'text-slate-400',
      divider: 'bg-slate-200/80',
    },
    feedback: {
      success: {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        text: 'text-emerald-700',
        solid: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      },
      warning: {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-700',
        solid: 'bg-amber-600 hover:bg-amber-700 text-white',
      },
      danger: {
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        text: 'text-rose-700',
        solid: 'bg-rose-600 hover:bg-rose-700 text-white',
      },
      info: {
        bg: 'bg-sky-50',
        border: 'border-sky-200',
        text: 'text-sky-700',
        solid: 'bg-sky-600 hover:bg-sky-700 text-white',
      },
    },
  },
  radius: {
    none: 'rounded-none',
    sm: 'rounded-lg',       // 8px
    md: 'rounded-xl',      // 12px
    lg: 'rounded-2xl',     // 16px
    xl: 'rounded-3xl',     // 24px
    full: 'rounded-full',  // Pills / Circles
  },
  shadow: {
    none: 'shadow-none',
    xs: 'shadow-xs',
    sm: 'shadow-sm',
    md: 'shadow-md shadow-slate-200/50',
    lg: 'shadow-lg shadow-slate-200/60',
    xl: 'shadow-xl shadow-slate-200/70',
    brand: 'shadow-sm shadow-indigo-500/20',
    brandLg: 'shadow-lg shadow-indigo-500/25',
    dropdown: 'shadow-xl shadow-slate-900/10',
    modal: 'shadow-2xl shadow-slate-900/20',
  },
  focus: {
    ring: 'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
    ringDanger: 'focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
    input: 'focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white',
    inputError: 'focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 focus:bg-rose-50/20',
    inputSuccess: 'focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white',
  },
  transitions: {
    fast: 'transition-all duration-150 ease-out',
    normal: 'transition-all duration-200 ease-out',
    smooth: 'transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1)',
    spring: 'transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  touch: {
    target: 'min-h-[44px] min-w-[44px]',
    iconTarget: 'min-h-[40px] min-w-[40px] sm:min-h-[36px] sm:min-w-[36px]',
  },
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
