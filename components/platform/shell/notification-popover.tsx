"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell } from "lucide-react";
import { cn } from "../../../lib/utils";
import styles from "./notification-popover.module.css";

export type AquaNotification = {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  read: boolean;
};

const defaultNotifications: AquaNotification[] = [
  {
    id: "density-alert",
    title: "Bolge yogunlugu artti",
    description: "Kuzey Ege icin balik yogunlugu son 30 dakikada %18 yukseldi.",
    timestamp: new Date(),
    read: false,
  },
  {
    id: "analysis-ready",
    title: "Analiz sonucu hazir",
    description: "Levrek tespit raporu kutuphaneye eklendi.",
    timestamp: new Date(Date.now() - 1000 * 60 * 42),
    read: false,
  },
  {
    id: "marine-update",
    title: "Deniz verisi guncellendi",
    description: "Ruzgar ve dalga verileri Open-Meteo kaynagindan yenilendi.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 7),
    read: true,
  },
];

export default function NotificationPopover({
  notifications: initialNotifications = defaultNotifications,
  buttonClassName,
  iconSize = 18,
  label = "Bildirimler",
  panelClassName,
}: {
  notifications?: AquaNotification[];
  buttonClassName?: string;
  iconSize?: number;
  label?: string;
  panelClassName?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const [notifications, setNotifications] = useState(initialNotifications);
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event: PointerEvent) => {
      if (popoverRef.current?.contains(event.target as Node)) return;
      setIsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  function markAllAsRead() {
    setNotifications((current) => current.map((notification) => ({ ...notification, read: true })));
  }

  function markAsRead(id: string) {
    setNotifications((current) => current.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)));
  }

  return (
    <div className={styles.wrap} ref={popoverRef}>
      <button
        type="button"
        className={cn(styles.trigger, buttonClassName)}
        aria-label={label}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <Bell size={iconSize} />
        {unreadCount > 0 ? <span className={styles.badge}>{unreadCount}</span> : null}
      </button>

      <AnimatePresence>
        {isOpen ? (
          <motion.section
            className={cn(styles.panel, panelClassName)}
            initial={{ opacity: 0, y: 10, scale: 0.96, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 8, scale: 0.96, filter: "blur(8px)" }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            aria-label="Bildirim listesi"
          >
            <header className={styles.header}>
              <h3>Bildirimler</h3>
              <button type="button" onClick={markAllAsRead}>
                Tumunu okundu yap
              </button>
            </header>

            <div className={styles.list}>
              {notifications.length ? (
                notifications.map((notification, index) => (
                  <motion.button
                    type="button"
                    key={notification.id}
                    className={styles.item}
                    onClick={() => markAsRead(notification.id)}
                    initial={{ opacity: 0, x: 18, filter: "blur(8px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.24, delay: index * 0.04, ease: "easeOut" }}
                  >
                    <span className={styles.itemTop}>
                      <span className={styles.title}>
                        {!notification.read ? <i className={styles.dot} aria-hidden="true" /> : null}
                        {notification.title}
                      </span>
                      <time className={styles.time}>{formatNotificationDate(notification.timestamp)}</time>
                    </span>
                    <span className={styles.description}>{notification.description}</span>
                  </motion.button>
                ))
              ) : (
                <div className={styles.empty}>Yeni bildirim yok.</div>
              )}
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function formatNotificationDate(value: Date) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}
