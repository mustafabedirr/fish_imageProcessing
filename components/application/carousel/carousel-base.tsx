"use client";

import { createContext, type ButtonHTMLAttributes, type HTMLAttributes, useContext, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type CarouselContextValue = {
  activeIndex: number;
  itemCount: number;
  setActiveIndex: (index: number) => void;
};

const CarouselContext = createContext<CarouselContextValue | null>(null);

function useCarousel() {
  const context = useContext(CarouselContext);
  if (!context) throw new Error("Carousel components must be used inside Carousel.Root");
  return context;
}

type CarouselRootProps = HTMLAttributes<HTMLDivElement> & {
  activeIndex?: number;
  defaultIndex?: number;
  itemCount?: number;
  onActiveIndexChange?: (index: number) => void;
};

function Root({ activeIndex, defaultIndex = 0, itemCount = 0, onActiveIndexChange, className, children, ...props }: CarouselRootProps) {
  const [internalIndex, setInternalIndex] = useState(defaultIndex);
  const controlled = typeof activeIndex === "number";
  const currentIndex = controlled ? activeIndex : internalIndex;

  const value = useMemo<CarouselContextValue>(() => ({
    activeIndex: Math.min(Math.max(currentIndex, 0), Math.max(itemCount - 1, 0)),
    itemCount,
    setActiveIndex: (nextIndex) => {
      const clamped = Math.min(Math.max(nextIndex, 0), Math.max(itemCount - 1, 0));
      if (!controlled) setInternalIndex(clamped);
      onActiveIndexChange?.(clamped);
    },
  }), [controlled, currentIndex, itemCount, onActiveIndexChange]);

  return (
    <CarouselContext.Provider value={value}>
      <div className={cn("carousel-root", className)} {...props}>{children}</div>
    </CarouselContext.Provider>
  );
}

function PrevTrigger({ className, onClick, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { activeIndex, setActiveIndex } = useCarousel();

  return (
    <button
      type="button"
      className={cn("carousel-trigger carousel-trigger--prev", className)}
      disabled={activeIndex === 0}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) setActiveIndex(activeIndex - 1);
      }}
      {...props}
    />
  );
}

function NextTrigger({ className, onClick, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { activeIndex, itemCount, setActiveIndex } = useCarousel();

  return (
    <button
      type="button"
      className={cn("carousel-trigger carousel-trigger--next", className)}
      disabled={activeIndex >= itemCount - 1}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) setActiveIndex(activeIndex + 1);
      }}
      {...props}
    />
  );
}

function Content({ className, style, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { activeIndex } = useCarousel();

  return (
    <div className="carousel-viewport">
      <div
        className={cn("carousel-content", className)}
        style={{ ...style, transform: `translate3d(${-activeIndex * 100}%, 0, 0)` }}
        {...props}
      />
    </div>
  );
}

function Item({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("carousel-item", className)} {...props} />;
}

export const Carousel = {
  Root,
  PrevTrigger,
  NextTrigger,
  Content,
  Item,
};
