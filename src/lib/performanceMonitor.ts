import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  componentName: string;
}

class PerformanceTracker {
  private metrics: Map<string, PerformanceMetrics> = new Map();
  
  startRender(componentName: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      const existing = this.metrics.get(componentName) || {
        renderCount: 0,
        lastRenderTime: 0,
        averageRenderTime: 0,
        componentName
      };
      
      const newCount = existing.renderCount + 1;
      const newAverage = (existing.averageRenderTime * existing.renderCount + renderTime) / newCount;
      
      this.metrics.set(componentName, {
        renderCount: newCount,
        lastRenderTime: renderTime,
        averageRenderTime: newAverage,
        componentName
      });
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${componentName}:`, {
          renderTime: `${renderTime.toFixed(2)}ms`,
          averageTime: `${newAverage.toFixed(2)}ms`,
          renderCount: newCount
        });
      }
    };
  }
  
  getMetrics(componentName?: string) {
    if (componentName) {
      return this.metrics.get(componentName);
    }
    return Array.from(this.metrics.values());
  }
  
  reset(componentName?: string) {
    if (componentName) {
      this.metrics.delete(componentName);
    } else {
      this.metrics.clear();
    }
  }
  
  logSummary() {
    if (process.env.NODE_ENV === 'development') {
      console.table(Array.from(this.metrics.values()));
    }
  }
}

export const performanceTracker = new PerformanceTracker();

// Hook to track component render performance
export function useRenderPerformance(componentName: string) {
  const renderStartRef = useRef<(() => void) | null>(null);
  
  // Start timing at the beginning of render
  renderStartRef.current = performanceTracker.startRender(componentName);
  
  // End timing after render completes
  useEffect(() => {
    if (renderStartRef.current) {
      renderStartRef.current();
    }
  });
  
  return {
    getMetrics: () => performanceTracker.getMetrics(componentName),
    reset: () => performanceTracker.reset(componentName),
  };
}

// Hook to monitor re-renders and their causes
export function useRenderCount(componentName: string, props?: Record<string, any>) {
  const renderCount = useRef(0);
  const prevProps = useRef(props);
  
  renderCount.current++;
  
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      if (props && prevProps.current) {
        const changedProps = Object.keys(props).filter(
          key => props[key] !== prevProps.current![key]
        );
        
        if (changedProps.length > 0) {
          console.log(`[Re-render] ${componentName} (${renderCount.current}) - Changed props:`, changedProps);
        }
      }
      
      prevProps.current = props;
    }
  });
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Render Count] ${componentName}: ${renderCount.current}`);
  }
  
  return renderCount.current;
}

// Memory usage tracker
export function useMemoryTracker(componentName: string) {
  const initialMemory = useRef<number>();
  
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
      const memory = (performance as any).memory;
      if (!initialMemory.current) {
        initialMemory.current = memory.usedJSHeapSize;
      }
      
      const currentMemory = memory.usedJSHeapSize;
      const memoryDiff = currentMemory - initialMemory.current;
      
      console.log(`[Memory] ${componentName}:`, {
        current: `${(currentMemory / 1024 / 1024).toFixed(2)}MB`,
        diff: `${(memoryDiff / 1024 / 1024).toFixed(2)}MB`,
        total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`
      });
    }
  });
}
