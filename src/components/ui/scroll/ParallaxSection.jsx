import React from 'react';

/**
 * ParallaxSection - Wrapper component for parallax effects
 * 
 * @param {number} speed - Parallax speed (0.5 = slower, 1.5 = faster)
 * @param {number} lag - Lag effect for smooth following (0-1)
 * @param {string} className - Additional CSS classes
 * @param {React.ReactNode} children - Content to wrap
 */
export default function ParallaxSection({ 
  speed = 1, 
  lag = 0, 
  className = '', 
  children,
  ...props 
}) {
  const dataAttributes = {};

  if (speed !== 1) {
    dataAttributes['data-speed'] = speed;
  }

  if (lag > 0) {
    dataAttributes['data-lag'] = lag;
  }

  return (
    <div 
      className={className}
      {...dataAttributes}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Preset parallax components for common use cases
 */
export function ParallaxHero({ children, className = '', ...props }) {
  return (
    <ParallaxSection speed={0.7} className={className} {...props}>
      {children}
    </ParallaxSection>
  );
}

export function ParallaxContent({ children, className = '', ...props }) {
  return (
    <ParallaxSection speed={1.1} lag={0.3} className={className} {...props}>
      {children}
    </ParallaxSection>
  );
}

export function ParallaxFloat({ children, className = '', ...props }) {
  return (
    <ParallaxSection speed={1.5} className={className} {...props}>
      {children}
    </ParallaxSection>
  );
}

export function ParallaxSlow({ children, className = '', ...props }) {
  return (
    <ParallaxSection speed={0.5} lag={0.5} className={className} {...props}>
      {children}
    </ParallaxSection>
  );
}