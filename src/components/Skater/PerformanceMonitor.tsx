import { useEffect } from "react";

interface PerformanceMonitorProps {
  itemCount: number;
  renderTime?: number;
}

export const PerformanceMonitor = ({ itemCount, renderTime }: PerformanceMonitorProps) => {
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'measure' && entry.name === 'skater-feed-render') {
            console.log(`SkaterFeed rendered ${itemCount} items in ${entry.duration.toFixed(2)}ms`);
          }
        }
      });
      
      observer.observe({ entryTypes: ['measure'] });
      
      return () => observer.disconnect();
    }
  }, [itemCount]);

  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      performance.mark('skater-feed-start');
      
      // Use requestAnimationFrame to measure render completion
      requestAnimationFrame(() => {
        performance.mark('skater-feed-end');
        performance.measure('skater-feed-render', 'skater-feed-start', 'skater-feed-end');
      });
    }
  }, [itemCount]);

  return null;
};
