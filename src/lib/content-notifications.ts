export interface ContentNotification {
  id: string;
  title: string;
  description: string;
  image?: string;
  timestamp: number;
  href: string;
}

export function buildContentNotifications(path: string, data: Record<string, any> | null, now: number): ContentNotification[] {
  const type = path === "series" ? "series" : path === "originals" ? "original" : "movie";
  const recent = (time: number) => time > 0 && time <= now && now - time < 2 * 86400000;
  return Object.entries(data || {}).flatMap(([id, value]) => {
    const created = new Date(value.createdAt || "").getTime();
    const updated = new Date(value.updatedAt || "").getTime();
    const href = `/play/${id}?type=${type}`;
    const results: ContentNotification[] = [];
    if (recent(created)) results.push({ id: `new-${path}-${id}`, title: value.title || "New content", description: type === "series" ? "New series added" : "Now available to watch", image: value.image, timestamp: created, href });
    if (type === "series") {
      const episodes = Object.values(value.episodes || {}).filter(Boolean) as any[];
      const dated = episodes.filter(ep => recent(new Date(ep.createdAt || ep.addedAt || "").getTime()));
      const newest = [...episodes].sort((a, b) => (Number(b.season) || 1) - (Number(a.season) || 1) || Number(b.episodeNumber) - Number(a.episodeNumber))[0];
      const updates = dated.length ? dated : updated > created && recent(updated) && newest ? [newest] : [];
      for (const ep of updates) {
        const season = Number(ep.season) || 1;
        const number = Number(ep.episodeNumber) || 1;
        results.push({ id: `ep-${id}-${season}-${number}`, title: value.title || "Series update", description: `Season ${season} · Episode ${number}${ep.title ? ` — ${ep.title}` : ""}`, image: value.image, timestamp: new Date(ep.createdAt || ep.addedAt || value.updatedAt).getTime(), href: `${href}&season=${season}&ep=${number}` });
      }
    }
    return results;
  });
}