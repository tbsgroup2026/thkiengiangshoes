"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";

export interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 3,
  className = "",
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalHeight = items.length * itemHeight;

  const { startIndex, endIndex } = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight) + 2 * overscan;
    const end = Math.min(items.length, start + visibleCount);
    return { startIndex: start, endIndex: end };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex).map((item, idx) => {
      const actualIndex = startIndex + idx;
      return {
        item,
        index: actualIndex,
        top: actualIndex * itemHeight,
      };
    });
  }, [items, startIndex, endIndex, itemHeight]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={`overflow-y-auto relative ${className}`}
      style={{ height: containerHeight }}
    >
      <div style={{ height: totalHeight, width: "100%", position: "relative" }}>
        {visibleItems.map(({ item, index, top }) => (
          <div
            key={index}
            style={{
              position: "absolute",
              top,
              left: 0,
              right: 0,
              height: itemHeight,
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}
