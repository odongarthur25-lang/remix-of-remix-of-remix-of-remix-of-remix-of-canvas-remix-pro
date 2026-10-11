import { useEffect, useRef } from "react";
import { database } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import { useAuth } from "@/lib/auth-context";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { buildContentNotifications } from "@/lib/content-notifications";

const SHOWN_KEY = "toast_shown_ids";

const getShownIds = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(SHOWN_KEY) || "[]");
  } catch {
    return [];
  }
};

const addShownIds = (ids: string[]) => {
  const current = getShownIds();
  const merged = [...current, ...ids].slice(-200);
  try {
    localStorage.setItem(SHOWN_KEY, JSON.stringify(merged));
  } catch {}
};

const getIcon = (id: string) => {
  if (id.startsWith("ep-")) return "🆕";
  if (id.includes("series")) return "📺";
  if (id.includes("originals")) return "🎬";
  return "🎬";
};

export default function NewContentToast() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const shown = useRef<string[]>(getShownIds());

  useEffect(() => {
    if (!user) return;

    const processPath = (path: string) =>
      onValue(ref(database, path), (snapshot) => {
        const fresh = buildContentNotifications(path, snapshot.val(), Date.now());
        const toShow = fresh.filter((n) => !shown.current.includes(n.id));
        if (toShow.length === 0) return;
        addShownIds(toShow.map((n) => n.id));
        shown.current = [...shown.current, ...toShow.map((n) => n.id)];
        toShow.forEach((n, index) => {
          setTimeout(() => {
            toast(`${getIcon(n.id)} ${n.title}`, {
              description: n.description,
              action: {
                label: "Watch now",
                onClick: () => navigate(n.href),
              },
              duration: 8000,
            });
          }, 1500 + index * 2500);
        });
      });

    const unsubs = [
      processPath("movies"),
      processPath("series"),
      processPath("originals"),
    ];
    return () => unsubs.forEach((u) => u());
  }, [user?.uid, navigate]);

  return null;
}
