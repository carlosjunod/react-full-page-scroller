import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Core scrolling component with dot controls and SSR safety
 */
const FullPageScrollerCore = forwardRef(({
  children,
  axis = 'vertical',
  threshold = 100,
  duration = 0.8,
  control = true,
  controlPos = 'right',
  dotComponent: DotComponent,
  onScrollStart,
  onScroll,
  onScrollEnd,
  fallback = null,
  enabled = true,
}, ref) => {
  const isClient = typeof window !== 'undefined';
  const items = React.Children.toArray(children);
  const [page, setPage] = useState(0);
  const isAnimating = useRef(false);
  const prevPage = useRef(page);
  const containerRef = useRef(null);
  const delta = useRef(0);
  const touchStart = useRef(0);

  // Imperative API
  useImperativeHandle(
    ref,
    () => ({
      next: () => changePage(page + 1),
      prev: () => changePage(page - 1),
      goTo: (i) => changePage(i),
      getCurrentPage: () => page,
    }),
    [page]
  );

  useEffect(() => {
    prevPage.current = page;
  }, [page]);

  const changePage = (newPage) => {
    if (!isClient || newPage < 0 || newPage >= items.length || isAnimating.current)
      return;
    onScrollStart?.(newPage);
    onScroll?.(newPage);
    isAnimating.current = true;
    setPage(newPage);
    setTimeout(() => {
      isAnimating.current = false;
      onScrollEnd?.(newPage);
    }, duration * 1000);
    delta.current = 0;
  };

  const handleWheel = (e) => {
    if (!isClient) return;
    e.preventDefault();
    if (isAnimating.current) return;
    const d = axis === 'vertical' ? e.deltaY : e.deltaX;
    delta.current += d;
    if (delta.current > threshold) changePage(page + 1);
    else if (delta.current < -threshold) changePage(page - 1);
  };

  const handleTouchStart = (e) => {
    if (!isClient) return;
    touchStart.current = axis === 'vertical'
      ? e.touches[0].clientY
      : e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    if (!isClient) return;
    if (isAnimating.current) return;
    const current = axis === 'vertical'
      ? e.touches[0].clientY
      : e.touches[0].clientX;
    const d = touchStart.current - current;
    if (d > threshold) changePage(page + 1);
    else if (d < -threshold) changePage(page - 1);
    touchStart.current = current;
    e.preventDefault();
  };

  useEffect(() => {
    if (!isClient || !enabled) return;
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
    };
  }, [page, axis, isClient, enabled, threshold]);

  // Dot control container style
  const controlStyles = useMemo(() => {
    const base = { position: 'absolute', display: 'flex', zIndex: 10, gap: 8 };
    if (controlPos === 'left' || controlPos === 'right') {
      return {
        ...base,
        flexDirection: 'column',
        top: '50%',
        transform: 'translateY(-50%)',
        [controlPos]: 20,
      };
    }
    return {
      ...base,
      flexDirection: 'row',
      left: '50%',
      transform: 'translateX(-50%)',
      [controlPos]: 20,
    };
  }, [controlPos]);

  const axisProp = axis === 'vertical' ? 'y' : 'x';

  if (!enabled) {
    const wrapperStyle =
      axis === 'horizontal'
        ? { display: 'flex', flexDirection: 'row' }
        : undefined;
    return <div style={wrapperStyle}>{children}</div>;
  }

  return (
    <div
      ref={containerRef}
      style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}
    >
      <AnimatePresence initial={false} custom={page}>
        <motion.div
          key={page}
          custom={page}
          initial={{ [axisProp]: prevPage.current < page ? '100%' : '-100%' }}
          animate={{ [axisProp]: '0%' }}
          exit={{ [axisProp]: prevPage.current < page ? '-100%' : '100%' }}
          transition={{ duration, ease: 'easeInOut' }}
          style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0 }}
        >
          <React.Suspense fallback={fallback}>{items[page]}</React.Suspense>
        </motion.div>
      </AnimatePresence>

      {control && isClient && (
        <div style={controlStyles}>
          {items.map((_, idx) => (
            <div key={idx} onClick={() => changePage(idx)} style={{ cursor: 'pointer' }}>
              {DotComponent ? (
                <DotComponent active={idx === page} index={idx} />
              ) : (
                <div
                  style={{
                    width: idx === page ? 12 : 8,
                    height: idx === page ? 12 : 8,
                    borderRadius: '50%',
                    background: idx === page ? '#000' : '#ccc',
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

FullPageScrollerCore.displayName = 'FullPageScrollerCore';

/**
 * Context & Provider
 */
const ScrollerContext = createContext(null);

export const useFullPageScroller = () => {
  const ctx = useContext(ScrollerContext);
  if (!ctx) throw new Error('useFullPageScroller must be used within FullPageScrollerProvider');
  return ctx;
};

export const FullPageScrollerProvider = ({
  children,
  axis,
  threshold,
  duration,
  control,
  controlPos,
  dotComponent,
  fallback,
  enabled,
}) => {
  const ref = useRef();
  const [currentPage, setCurrentPage] = useState(0);
  const handleEnd = (i) => setCurrentPage(i);
  const value = useMemo(
    () => ({
      next: () => ref.current?.next(),
      prev: () => ref.current?.prev(),
      goTo: (i) => ref.current?.goTo(i),
      getCurrentPage: () => ref.current?.getCurrentPage(),
      currentPage,
    }),
    [currentPage]
  );

  const enhanced = React.Children.map(children, (child) =>
    React.isValidElement(child) && child.type.displayName === 'FullPageScrollerCore'
      ? React.cloneElement(child, {
          ref,
          axis,
          threshold,
          duration,
          control,
          controlPos,
          dotComponent,
          fallback,
          enabled,
          onScrollEnd: handleEnd,
        })
      : child
  );

  return <ScrollerContext.Provider value={value}>{enhanced}</ScrollerContext.Provider>;
};

/**
 * Exports
 */
export { FullPageScrollerCore as FullPageScroller };
export default FullPageScrollerCore;
