import React, { createContext, useContext, useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { tokens } from '../../lib/design-tokens';

interface TabsContextType {
  activeTab: string;
  setActiveTab: (val: string) => void;
  variant: 'pills' | 'underline';
  layoutIdPrefix: string;
}

const TabsContext = createContext<TabsContextType | null>(null);

function useTabs() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs compound components must be rendered inside a Tabs provider');
  }
  return context;
}

export interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  variant?: 'pills' | 'underline';
  children: React.ReactNode;
  className?: string;
}

export function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange,
  variant = 'pills',
  children,
  className,
}: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState<string>(defaultValue || '');
  const isControlled = controlledValue !== undefined;
  const activeTab = isControlled ? controlledValue : uncontrolledValue;
  const instanceId = React.useId();

  const setActiveTab = (val: string) => {
    if (!isControlled) {
      setUncontrolledValue(val);
    }
    onValueChange?.(val);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, variant, layoutIdPrefix: instanceId }}>
      <div className={cn('w-full flex flex-col', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export interface TabListProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export function TabList({ children, className, fullWidth = false }: TabListProps) {
  const { variant } = useTabs();

  return (
    <div
      role="tablist"
      className={cn(
        'flex items-center gap-1 overflow-x-auto no-scrollbar',
        variant === 'pills' && 'bg-slate-100 dark:bg-slate-900/90 p-1 rounded-2xl border border-slate-200 dark:border-slate-800/60',
        variant === 'underline' && 'border-b border-slate-200 dark:border-slate-800 gap-4',
        fullWidth && 'w-full',
        className
      )}
    >
      {children}
    </div>
  );
}

export interface TabTriggerProps {
  value: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function TabTrigger({
  value,
  children,
  icon,
  badge,
  className,
  disabled = false,
}: TabTriggerProps) {
  const { activeTab, setActiveTab, variant, layoutIdPrefix } = useTabs();
  const isActive = activeTab === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      onClick={() => setActiveTab(value)}
      className={cn(
        'relative flex items-center justify-center gap-2 font-semibold text-sm transition-colors duration-200 select-none whitespace-nowrap min-h-[40px] px-4 py-2',
        variant === 'pills' && [
          'rounded-xl z-10 flex-1',
          isActive ? 'text-slate-950 font-bold' : 'text-slate-600 hover:text-slate-900 dark:text-slate-100',
        ],
        variant === 'underline' && [
          'pb-3 font-medium',
          isActive ? 'text-slate-900 dark:text-slate-100 font-bold' : 'text-slate-500 hover:text-slate-800 dark:text-slate-100',
        ],
        disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
        className
      )}
    >
      {icon && <span className="inline-flex shrink-0 items-center text-current">{icon}</span>}
      <span>{children}</span>
      {badge && <span className="inline-flex shrink-0 items-center">{badge}</span>}

      {/* Animated Active Indicator */}
      {isActive && variant === 'pills' && (
        <motion.div
          layoutId={`${layoutIdPrefix}-pill-indicator`}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          className="absolute inset-0 bg-white dark:bg-slate-950 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800/70 -z-10"
        />
      )}

      {isActive && variant === 'underline' && (
        <motion.div
          layoutId={`${layoutIdPrefix}-line-indicator`}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full"
        />
      )}
    </button>
  );
}

export interface TabContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function TabContent({ value, children, className }: TabContentProps) {
  const { activeTab } = useTabs();
  if (activeTab !== value) return null;

  return (
    <div
      role="tabpanel"
      tabIndex={0}
      className={cn('pt-4 focus:outline-none animate-in fade-in duration-200', className)}
    >
      {children}
    </div>
  );
}
