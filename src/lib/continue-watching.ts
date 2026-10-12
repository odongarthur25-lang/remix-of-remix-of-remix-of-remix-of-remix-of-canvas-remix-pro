export interface ContinueWatchingEntry {
  id: string;
  type: string;
  title: string;
  image: string;
  season?: number;
  ep?: number;
  ts: number;
}

const KEY = "continue_watching";
const MAX_ENTRIES = 12;

export function getContinueWatching(): ContinueWatchingEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list
      .filter((e) => e && e.id && e.title)
      .sort((a, b) => (b.ts || 0) - (a.ts || 0));
  } catch {
    return [];
  }
}

export function recordContinueWatching(entry: ContinueWatchingEntry) {
  try {
    const list = getContinueWatching().filter(
      (e) => !(e.id === entry.id && (e.season || 0) === (entry.season || 0) && (e.ep || 0) === (entry.ep || 0))
    );
    list.unshift(entry);
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX_ENTRIES)));
  } catch {}
}
