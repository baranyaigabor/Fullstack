'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type ScrollRevealProps = {
  delay?: number;
  once?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

export default function ScrollReveal({
  children,
  className,
  delay = 0,
  once = false,
  style,
  ...props
}: ScrollRevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);

          if (once) {
            observer.unobserve(entry.target);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.15,
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [once]);

  return (
    <div
      ref={ref}
      className={cn(
        'translate-y-6 opacity-0 transition-all duration-700 ease-out will-change-transform',
        isVisible && 'translate-y-0 opacity-100',
        className,
      )}
      style={{ transitionDelay: `${delay}ms`, ...style }}
      {...props}
    >
      {children}
    </div>
  );
}
