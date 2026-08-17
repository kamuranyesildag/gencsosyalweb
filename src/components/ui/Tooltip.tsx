import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { tooltipVariants } from '../../lib/motion';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  placement?: TooltipPlacement;
  delay?: number;
  className?: string;
}

const placementStyles: Record<TooltipPlacement, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

const arrowStyles: Record<TooltipPlacement, string> = {
  top: 'bottom-[-4px] left-1/2 -translate-x-1/2 border-t-slate-900 border-l-transparent border-r-transparent border-b-transparent border-t-4 border-l-4 border-r-4',
  bottom: 'top-[-4px] left-1/2 -translate-x-1/2 border-b-slate-900 border-l-transparent border-r-transparent border-t-transparent border-b-4 border-l-4 border-r-4',
  left: 'right-[-4px] top-1/2 -translate-y-1/2 border-l-slate-900 border-t-transparent border-b-transparent border-r-transparent border-l-4 border-t-4 border-b-4',
  right: 'left-[-4px] top-1/2 -translate-y-1/2 border-r-slate-900 border-t-transparent border-b-transparent border-l-transparent border-r-4 border-t-4 border-b-4',
};

export function Tooltip({
  content,
  children,
  placement = 'top',
  delay = 200,
  className,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipId = React.useId();

  const show = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hide = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  if (!content) return children;

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {React.cloneElement(children, {
        'aria-describedby': isVisible ? tooltipId : undefined,
      })}

      <AnimatePresence>
        {isVisible && (
          <motion.div
            id={tooltipId}
            role="tooltip"
            variants={tooltipVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={cn(
              'absolute z-50 px-2.5 py-1 text-xs font-semibold text-white bg-slate-900 rounded-lg shadow-md whitespace-nowrap pointer-events-none select-none',
              placementStyles[placement],
              className
            )}
          >
            {content}
            <span className={cn('absolute w-0 h-0 border-solid', arrowStyles[placement])} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
