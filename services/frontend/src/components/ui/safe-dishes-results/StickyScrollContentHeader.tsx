import { theme } from '../../../constants/theme';
import { useState, useEffect, useRef } from 'react';

interface SafetySummaryItem {
  label: string;
  count: number;
  // Color object from theme (e.g., theme.colors.success)
  color: any;
  // Optional icon when in compact mode
  icon?: string;
}

interface StickyScrollContentHeaderProps {
  /** Current view mode */
  viewMode: 'deck' | 'list';
  /** Toggle handler swapped between list and deck */
  onToggle: () => void;
  /** Safety summary data to render as pills */
  summary: SafetySummaryItem[];
}

/**
 * Sticky header that stays at the top of the viewport on mobile
 * showing a small iOS-style switch allowing users to toggle
 * between the swipe card deck and list view.
 */
export function StickyScrollContentHeader({ viewMode, onToggle, summary }: StickyScrollContentHeaderProps) {
  const [compact, setCompact] = useState(false);
  const pillsRef = useRef<HTMLDivElement | null>(null);

  // Determine whether scrolling is needed and toggle compact mode using ResizeObserver
  useEffect(() => {
    const element = pillsRef.current;
    if (!element) return;

    const checkOverflow = () => {
      const { scrollWidth, clientWidth } = element;
      console.log('scrollWidth', scrollWidth);
      console.log('clientWidth', clientWidth);
      setCompact(scrollWidth > clientWidth);
    };

    checkOverflow(); // Initial check

    const resizeObserver = new ResizeObserver(checkOverflow);
    resizeObserver.observe(element);

    window.addEventListener('resize', checkOverflow);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', checkOverflow);
    };
  }, []);

  const resolveIcon = (label: string) => {
    switch (label) {
      case 'Very Safe':
        return '✅';
      case 'Caution':
        return '⚠️';
      case 'Avoid':
        return '🚫';
      default:
        return '•';
    }
  };

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: parseInt(theme.zIndex[40], 10),
        backgroundColor: theme.colors.white,
        paddingTop: theme.spacing[2],
        paddingBottom: theme.spacing[2],
        paddingLeft: theme.spacing[3],
        paddingRight: theme.spacing[3],
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: theme.boxShadow.sm,
        borderRadius: theme.borderRadius.lg,
        marginBottom: theme.spacing[4],
        gap: theme.spacing[3],
      }}
    >
      {/* Safety summary pills */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing[2],
          overflowX: 'auto',
          flex: 1,
        }}
        ref={pillsRef}
      >
        {summary.map(item => (
          <div
            key={item.label}
            style={{
              backgroundColor: item.color[50],
              border: `1px solid ${item.color[200]}`,
              color: item.color[700],
              padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
              borderRadius: theme.borderRadius.full,
              fontSize: theme.typography.fontSize.xs,
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing[1],
              flexShrink: 0,
            }}
          >
            <strong style={{ fontSize: theme.typography.fontSize.sm }}>{item.count}</strong>
            <span>{compact ? item.icon ?? resolveIcon(item.label) : item.label}</span>
          </div>
        ))}
      </div>

      {/* Toggle section */}
      <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <span
          style={{
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.neutral[600],
            marginRight: theme.spacing[2],
            userSelect: 'none',
          }}
        >
          Card View
        </span>

        <button
          type="button"
          role="switch"
          aria-checked={viewMode === 'deck'}
          aria-label="Toggle card view"
          onClick={onToggle}
          style={{
            width: '44px',
            height: '24px',
            borderRadius: '9999px',
            backgroundColor:
              viewMode === 'deck' ? theme.colors.primary[500] : theme.colors.neutral[300],
            position: 'relative',
            transition: 'background-color 0.2s ease',
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: '2px',
              left: viewMode === 'deck' ? '22px' : '2px',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: theme.colors.white,
              boxShadow: '0 1px 2px rgba(0,0,0,0.25)',
              transition: 'left 0.2s ease',
            }}
          />
        </button>
      </div>
    </div>
  );
} 