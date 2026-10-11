import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { database } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { useAuth } from "@/lib/auth-context";
import { useNavigate } from "react-router-dom";
import {
  buildContentNotifications,
  type ContentNotification,
} from "@/lib/content-notifications";

const READ_KEY = "read_notifications";

const getReadNotifications = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(READ_KEY) || "[]");
  } catch {
    return [];
  }
};

const markAsRead = (ids: string[]) => {
  const current = getReadNotifications();
  const merged = Array.from(new Set([...current, ...ids]));
  localStorage.setItem(READ_KEY, JSON.stringify(merged));
};

const getIcon = (n: ContentNotification) => {
  if (n.id.startsWith("ep-")) return "🆕";
  if (n.id.includes("series")) return "📺";
  if (n.id.includes("originals")) return "🎬";
  return "🎬";
};

export default function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<ContentNotification[]>([]);
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>(getReadNotifications());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const allNotifications: ContentNotification[] = [];
    const processPath = (path: string) =>
      onValue(ref(database, path), (snapshot) => {
        const fresh = buildContentNotifications(path, snapshot.val(), Date.now());
        fresh.forEach((n) => allNotifications.push(n));
        const unique = Array.from(
          new Map(allNotifications.map((n) => [n.id, n])).values()
        ).sort((a, b) => b.timestamp - a.timestamp);
        setNotifications(unique);
      });

    const unsubs = [
      processPath("movies"),
      processPath("series"),
      processPath("originals"),
    ];
    return () => unsubs.forEach((u) => u());
  }, [user?.uid]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !readIds.includes(n.id)).length;

  const handleNotificationClick = (n: ContentNotification) => {
    markAsRead([n.id]);
    setReadIds(getReadNotifications());
    setOpen(false);
    navigate(n.href);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-foreground hover:text-primary hover:bg-muted rounded-full transition relative"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-[16px] px-1 bg-red-500 text-white text-[9px] font-bold rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
            <h3 className="text-sm font-bold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => {
                  markAsRead(notifications.map((n) => n.id));
                  setReadIds(getReadNotifications());
                }}
                className="text-xs text-primary hover:underline font-medium"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => {
                const isRead = readIds.includes(n.id);
                return (
                  <button
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`w-full text-left flex items-start gap-2.5 px-3 py-2.5 border-b border-border/50 transition hover:bg-muted ${
                      isRead ? "opacity-60" : "bg-primary/5"
                    }`}
                  >
                    <span className="text-base leading-none mt-0.5">{getIcon(n)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-foreground truncate">{n.title}</p>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{n.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-primary font-medium">Watch now →</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(n.timestamp).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                    {!isRead && (
                      <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
