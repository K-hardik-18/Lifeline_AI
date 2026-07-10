'use client';

import React, { useRef, useEffect, useState } from 'react';

export default function WheelPicker({ options, value, onChange, label }) {
  const containerRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);

  const ITEM_HEIGHT = 40;

  // Handle initial scroll position and external value changes
  useEffect(() => {
    if (containerRef.current && !isScrolling) {
      const index = options.findIndex((o) => o === value);
      if (index !== -1) {
        containerRef.current.scrollTop = index * ITEM_HEIGHT;
      }
    }
  }, [value, options, isScrolling]);

  const handleScroll = (e) => {
    const container = e.target;
    const index = Math.round(container.scrollTop / ITEM_HEIGHT);
    
    if (options[index] !== undefined && options[index] !== value) {
      onChange(options[index]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {label && <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>}
      <div 
        style={{ 
          position: 'relative', 
          height: ITEM_HEIGHT * 3, 
          width: '60px', 
          overflow: 'hidden',
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
        }}
      >
        {/* Selection Highlight */}
        <div 
          style={{
            position: 'absolute',
            top: ITEM_HEIGHT,
            left: 0,
            right: 0,
            height: ITEM_HEIGHT,
            background: 'var(--bg-glass-hover)',
            borderTop: '1px solid var(--border-color)',
            borderBottom: '1px solid var(--border-color)',
            pointerEvents: 'none'
          }}
        />

        <div
          ref={containerRef}
          onScroll={handleScroll}
          onTouchStart={() => setIsScrolling(true)}
          onTouchEnd={() => setIsScrolling(false)}
          onMouseDown={() => setIsScrolling(true)}
          onMouseUp={() => setIsScrolling(false)}
          onMouseLeave={() => setIsScrolling(false)}
          style={{
            height: '100%',
            overflowY: 'auto',
            scrollSnapType: 'y mandatory',
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none', // IE
            paddingTop: ITEM_HEIGHT,
            paddingBottom: ITEM_HEIGHT
          }}
          className="no-scrollbar"
        >
          <style dangerouslySetInnerHTML={{__html: `
            .no-scrollbar::-webkit-scrollbar { display: none; }
          `}} />
          {options.map((opt, i) => (
            <div 
              key={i}
              style={{
                height: ITEM_HEIGHT,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                scrollSnapAlign: 'center',
                fontSize: 18,
                fontWeight: value === opt ? 700 : 400,
                color: value === opt ? 'var(--text-primary)' : 'var(--text-tertiary)',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onClick={() => {
                if (containerRef.current) {
                  containerRef.current.scrollTo({ top: i * ITEM_HEIGHT, behavior: 'smooth' });
                }
              }}
            >
              {opt.toString().padStart(2, '0')}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
