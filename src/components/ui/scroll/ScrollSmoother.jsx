import React, { useEffect, useRef } from 'react';

export default function ScrollSmootherWrapper({ children, enabled = true }) {
  const wrapperRef = useRef(null);
  const contentRef = useRef(null);
  const scrollPositionRef = useRef(0);
  const targetScrollRef = useRef(0);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // Inject styles
    const styleId = 'scroll-smoother-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        .smooth-scroll-wrapper {
          position: relative;
          width: 100%;
          overflow-x: hidden;
          overflow-y: auto;
        }
        
        .smooth-scroll-content {
          width: 100%;
        }
        
        [data-speed] {
          transition: transform 0.1s ease-out;
        }
        
        @media (prefers-reduced-motion: reduce) {
          [data-speed] {
            transform: none !important;
          }
        }
      `;
      document.head.appendChild(style);
    }

    const handleScroll = () => {
      if (!contentRef.current) return;

      const scrollY = window.scrollY || window.pageYOffset;
      const elements = contentRef.current.querySelectorAll('[data-speed]');

      elements.forEach((element) => {
        const speed = parseFloat(element.getAttribute('data-speed')) || 1;
        const lag = parseFloat(element.getAttribute('data-lag')) || 0;
        
        // Calculate parallax offset
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top + scrollY;
        const scrollProgress = scrollY - elementTop + window.innerHeight;
        
        if (scrollProgress > 0 && scrollProgress < window.innerHeight + rect.height) {
          const parallaxOffset = (scrollY - elementTop) * (1 - speed) * 0.5;
          const lagOffset = lag * parallaxOffset;
          
          requestAnimationFrame(() => {
            element.style.transform = `translate3d(0, ${parallaxOffset - lagOffset}px, 0)`;
          });
        }
      });
    };

    // Smooth scroll behavior
    const smoothScroll = () => {
      const delta = targetScrollRef.current - scrollPositionRef.current;
      scrollPositionRef.current += delta * 0.1;

      if (Math.abs(delta) > 0.5) {
        animationFrameRef.current = requestAnimationFrame(smoothScroll);
      }
    };

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial calculation
    handleScroll();

    // Recalculate on resize
    const handleResize = () => {
      handleScroll();
    };
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // Remove injected styles
      const styleElement = document.getElementById(styleId);
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, [enabled]);

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <div 
      ref={wrapperRef}
      className="smooth-scroll-wrapper"
    >
      <div 
        ref={contentRef}
        className="smooth-scroll-content"
      >
        {children}
      </div>
    </div>
  );
}