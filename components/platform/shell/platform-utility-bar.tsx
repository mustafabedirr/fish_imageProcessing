"use client";

import { Briefcase, ChevronDown, Mail, RefreshCw, Search } from "lucide-react";
import NotificationPopover from "./notification-popover";

export default function PlatformUtilityBar({
  placeholder = "Search species, type, region...",
}: {
  placeholder?: string;
}) {
  return (
    <header className="platform-utility-bar">
      <label className="platform-utility-search">
        <Search size={18} />
        <input placeholder={placeholder} aria-label={placeholder} />
        <kbd>Ctrl K</kbd>
      </label>

      <div className="platform-utility-actions">
        <button type="button" className="platform-utility-icon" aria-label="Workspace">
          <Briefcase size={20} />
        </button>
        <button type="button" className="platform-utility-icon" aria-label="Sync">
          <RefreshCw size={20} />
        </button>
        <button type="button" className="platform-utility-icon" aria-label="Messages">
          <Mail size={20} />
        </button>
        <NotificationPopover buttonClassName="platform-utility-icon platform-utility-icon--count" iconSize={20} label="Notifications" />

        <button type="button" className="platform-utility-profile" aria-label="Open profile menu">
          <img
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=72&q=80"
            alt="Alicia Vikander"
          />
          <ChevronDown size={16} />
        </button>
      </div>
    </header>
  );
}
