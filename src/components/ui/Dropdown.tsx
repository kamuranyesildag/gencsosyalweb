import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { dropdownVariants } from '../../lib/motion';

interface DropdownContextType {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  close: () => void;
}

const DropdownContext = createContext<DropdownContextType | null>(null);

export function useDropdown() {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('useDropdown must be used within a Dropdown');
  }
  return context;
}

export interface DropdownProps {
  children: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export function Dropdown({ children, isOpen: controlledOpen, onOpenChange, className }: DropdownProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

  const setIsOpen = (val: boolean | ((prev: boolean) => boolean)) => {
    const nextVal = typeof val === 'function' ? val(isOpen) : val;
    if (!isControlled) {
      setUncontrolledOpen(nextVal);
    }
    onOpenChange?.(nextVal);
  };

  const close = () => setIsOpen(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        close();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen, close }}>
      <div ref={dropdownRef} className={cn('relative inline-block text-left', className)}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

export interface DropdownTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
  className?: string;
}

export function DropdownTrigger({ children, className }: DropdownTriggerProps) {
  const { isOpen, setIsOpen } = useDropdown();

  return (
    <div
      onClick={() => setIsOpen((prev) => !prev)}
      aria-expanded={isOpen}
      aria-haspopup="true"
      className={cn('inline-flex cursor-pointer select-none', className)}
    >
      {children}
    </div>
  );
}

export interface DropdownContentProps {
  children: React.ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
  width?: string;
}

export function DropdownContent({
  children,
  align = 'right',
  className,
  width = 'w-56',
}: DropdownContentProps) {
  const { isOpen } = useDropdown();

  const alignStyles = {
    left: 'left-0 origin-top-left',
    right: 'right-0 origin-top-right',
    center: 'left-1/2 -translate-x-1/2 origin-top',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={dropdownVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          role="menu"
          className={cn(
            'absolute top-full mt-2 z-50 bg-white border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-900/10 py-1.5 overflow-hidden',
            width,
            alignStyles[align],
            className
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export interface DropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  isDanger?: boolean;
  className?: string;
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}

export function DropdownItem({
  children,
  icon,
  isDanger = false,
  className,
  onClick,
  disabled,
  ...props
}: DropdownItemProps) {
  const { close } = useDropdown();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    onClick?.(e);
    close();
  };

  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        'w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium text-left transition-colors duration-150',
        isDanger
          ? 'text-rose-600 hover:bg-rose-50 active:bg-rose-100'
          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100',
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className
      )}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0 items-center text-current">{icon}</span>}
      <span className="flex-1 truncate">{children}</span>
    </button>
  );
}

export function DropdownHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('px-3.5 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider', className)}>
      {children}
    </div>
  );
}

export function DropdownDivider({ className }: { className?: string }) {
  return <div className={cn('h-px my-1.5 bg-slate-100', className)} role="separator" />;
}
