// HorizontalScrollShowcase.jsx
import React, { useRef, useEffect, Children } from 'react';
import gsap from 'gsap';

export const HorizontalScrollShowcase = ({ children }) => {
  const wrapperRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const numberOfSections = Children.count(children);
  const currentX = useRef(0);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const container = scrollContainerRef.current;
    if (!wrapper || !container) return;

    // 1) Disable native vertical scroll
    const origOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';

    const sectionWidth = window.innerWidth;
    const maxScroll = -((numberOfSections - 1) * sectionWidth);

    const handleWheel = (e) => {
      e.preventDefault(); // prevent any vertical scroll
      const delta = e.deltaY;
      let targetX = currentX.current - delta;
      targetX = Math.max(Math.min(targetX, 0), maxScroll);
      currentX.current = targetX;

      gsap.to(container, {
        x: targetX,
        duration: 0.6,
        ease: 'power3.out',
      });
    };

    // 2) Listen to wheel only on our fixed wrapper
    wrapper.addEventListener('wheel', handleWheel, { passive: false });

    // Cleanup on unmount
    return () => {
      wrapper.removeEventListener('wheel', handleWheel);
      document.documentElement.style.overflow = origOverflow;
    };
  }, [numberOfSections]);

  return (
    <div
      ref={wrapperRef}
      className="fixed inset-0 overflow-hidden bg-[var(--bg-original-dark)]"
    >
      <div
        ref={scrollContainerRef}
        className="flex h-full will-change-transform"
        style={{ width: `${numberOfSections * 100}vw` }}
      >
        {Children.map(children, (child, i) => (
          <div key={i} className="w-screen h-full flex-shrink-0">
            {child}
          </div>
        ))}
      </div>
    </div>
  );
};
