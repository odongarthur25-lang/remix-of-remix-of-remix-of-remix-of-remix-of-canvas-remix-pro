import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { database } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import { X, Play, Megaphone } from "lucide-react";

interface AdItem {
  id: string;
  title: string;
  image: string;
  rating?: number;
  type: string;
  createdAt?: string;
}

// Full-screen ad-style promo shown once per visit, advertising the
// newest movie or series in the catalog.
export default function PromoAd() {
  const [item, setItem] = useState<AdItem | null>(null);
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let alreadyShown = false;
    try { alreadyShown = sessionStorage.getItem("promo_ad_shown") === "1"; } catch {}
    if (alreadyShown) return;

    (async () => {
      const paths: [string, string][] = [["movies", "movie"], ["series", "series"], ["originals", "original"]];
      const snaps = await Promise.all(paths.map(([p]) => get(ref(database, p))));
      const all: AdItem[] = [];
      snaps.forEach((snap, i) => {
        if (!snap.exists()) return;
        Object.entries(snap.val()).forEach(([id, v]: [string, any]) => {
          if (v?.isAgentOnly === true) return;
          all.push({ id, title: v.title, image: v.image, rating: v.rating, type: paths[i][1], createdAt: v.createdAt });
        });
      });
      all.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      const pick = all.find((a) => a.image);
      if (pick) {
        setItem(pick);
        setVisible(true);
        try { sessionStorage.setItem("promo_ad_shown", "1"); } catch {}
      }
    })().catch(() => {});
  }, []);

  // Auto-dismiss after 15 seconds like a skippable ad
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setVisible(false), 15000);
    return () => clearTimeout(t);
  }, [visible]);

  if (!visible || !item) return null;

  const watchNow = () => {
    setVisible(false);
    navigate(`/play/${item.id}?type=${item.type}`);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-media-overlay/80 backdrop-blur-sm"
      role="dialog"
      aria-label="Advertisement"
    >
      <div className="relative w-full max-w-sm md:max-w-md rounded-2xl overflow-hidden border border-border shadow-2xl bg-card">
        <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-media-overlay via-media-overlay/60 to-transparent" />

        <span className="absolute top-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded bg-media-overlay/70 text-media-foreground text-[10px] font-bold uppercase tracking-widest">
          <Megaphone className="w-3 h-3" /> Ad
        </span>
        <button
          onClick={() => setVisible(false)}
          aria-label="Close ad"
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-media-overlay/70 text-media-foreground flex items-center justify-center hover:bg-media-overlay/90 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative pt-56 md:pt-72 p-5 flex flex-col gap-1.5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-primary">New on Dimpoz Movies</p>
          <h2 className="text-media-foreground text-xl font-extrabold leading-tight">{item.title}</h2>
          {item.rating ? <p className="text-agent text-xs font-bold">★ {item.rating} · {item.type === "series" ? "Series" : item.type === "original" ? "Original" : "Movie"}</p> : null}
          <div className="flex gap-2 mt-2">
            <button
              onClick={watchNow}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition"
            >
              <Play className="w-4 h-4" /> Watch Now
            </button>
            <button
              onClick={() => setVisible(false)}
              className="px-4 py-2.5 rounded-xl bg-media-foreground/10 text-media-foreground text-sm font-semibold border border-media-foreground/20 hover:bg-media-foreground/20 transition"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
