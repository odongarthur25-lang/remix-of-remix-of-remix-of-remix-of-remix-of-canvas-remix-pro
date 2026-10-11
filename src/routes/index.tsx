import { createFileRoute } from "@tanstack/react-router";
import App from "@/App";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Dimpoz Movies 3 — Movies, Series & Agent Zone" },
    { name: "description", content: "Browse Dimpoz Movies, discover new series episodes and watch with an activated subscription." },
    { property: "og:title", content: "Dimpoz Movies 3 — Movies, Series & Agent Zone" },
    { property: "og:description", content: "Discover movies, new episodes and Agent Zone early access." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: AppShell,
  ssr: false,
});

function AppShell() {
  return <App />;
}
