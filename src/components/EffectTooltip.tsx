import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Effect } from '../types/effects';
import { getEffectDescription, getEffectDurationText } from '../utils/effectDescriptions';

interface EffectTooltipProps {
  effects: Effect[];
  children: React.ReactNode;
  offsetX?: number;
  offsetY?: number;
}

export function EffectTooltip({ effects, children, offsetX = 15, offsetY = -15 }: EffectTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const sparkleRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (showTooltip && sparkleRef.current) {
      const rect = sparkleRef.current.getBoundingClientRect();
      setTooltipPos({
        x: rect.left + rect.width / 2 + offsetX,
        y: rect.top + rect.height / 2 + offsetY
      });
    }
  }, [showTooltip, offsetX, offsetY]);

  if (effects.length === 0) {
    return <>{children}</>;
  }

  return (
    <>
      <g
        ref={sparkleRef}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        style={{ pointerEvents: 'auto' }}
      >
        {children}
      </g>
      {showTooltip && createPortal(
        <div
          style={{
            position: 'fixed',
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            backgroundColor: 'rgba(15, 23, 42, 0.98)',
            border: '2px solid #fbbf24',
            borderRadius: '8px',
            padding: '8px 12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.6)',
            fontSize: '12px',
            lineHeight: '1.4',
            color: '#f1f5f9',
            maxWidth: '220px',
            whiteSpace: 'normal',
            pointerEvents: 'none',
            zIndex: 10000,
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '6px', color: '#fbbf24', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Active Effects
          </div>
          {effects.map((effect, index) => {
            const description = getEffectDescription(effect);
            const duration = getEffectDurationText(effect);

            return (
              <div key={effect.id || index} style={{ marginBottom: index < effects.length - 1 ? '6px' : '0' }}>
                <div style={{ color: '#fde68a', fontWeight: '600', fontSize: '12px' }}>
                  {description}
                </div>
                {duration && (
                  <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '2px' }}>
                    {duration}
                  </div>
                )}
                {effect.sourceCardTitle && (
                  <div style={{ color: '#a78bfa', fontSize: '10px', marginTop: '2px', fontStyle: 'italic' }}>
                    from {effect.sourceCardTitle}
                  </div>
                )}
              </div>
            );
          })}
        </div>,
        document.body
      )}
    </>
  );
}
