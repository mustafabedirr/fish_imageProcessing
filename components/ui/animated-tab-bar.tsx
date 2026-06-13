"use client";

import type { ComponentType, ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

type TabIcon = ComponentType<{ size?: number; className?: string }>;

export type AnimatedTabItem<TValue extends string> = {
  title: string;
  value: TValue;
  icon?: TabIcon;
};

type AnimatedTabBarProps<TValue extends string> = {
  tabs: AnimatedTabItem<TValue>[];
  activeValue: TValue;
  onChange: (value: TValue) => void;
  ariaLabel: string;
  className?: string;
  buttonClassName?: string;
  activeButtonClassName?: string;
  layoutId?: string;
  trailingContent?: ReactNode;
};

export default function AnimatedTabBar<TValue extends string>({
  tabs,
  activeValue,
  onChange,
  ariaLabel,
  className,
  buttonClassName,
  activeButtonClassName,
  layoutId = "aqua-animated-tab",
  trailingContent,
}: AnimatedTabBarProps<TValue>) {
  return (
    <nav className={cn("animated-tab-bar", className)} aria-label={ariaLabel}>
      {tabs.map(({ title, value, icon: Icon }) => {
        const isActive = activeValue === value;

        return (
          <motion.button
            type="button"
            className={cn(buttonClassName, isActive && activeButtonClassName)}
            onClick={() => onChange(value)}
            key={value}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
          >
            {isActive ? (
              <motion.span
                className="animated-tab-indicator"
                layoutId={layoutId}
                transition={{ type: "spring", stiffness: 360, damping: 34, mass: 0.7 }}
              />
            ) : null}
            <motion.span
              className="animated-tab-label"
              animate={{ opacity: isActive ? 1 : 0.78, y: isActive ? -1 : 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {Icon ? <Icon size={18} /> : null}
              {title}
            </motion.span>
          </motion.button>
        );
      })}
      {trailingContent}
    </nav>
  );
}
