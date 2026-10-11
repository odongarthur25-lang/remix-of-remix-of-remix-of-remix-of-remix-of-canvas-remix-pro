import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import TopHeader from "@/components/TopHeader";
import MobileNav from "@/components/MobileNav";
import HeroCarousel from "@/components/HeroCarousel";
import PopularGrid from "@/components/PopularGrid";
import CategoriesRow from "@/components/CategoriesRow";
import AuthModal from "@/components/AuthModal";
import SubscriptionModal from "@/components/SubscriptionModal";
import NewContentToast from "@/components/NewContentToast";
import AgentBanner from "@/components/AgentBanner";
import SubscriberStatusBanner from "@/components/SubscriberStatusBanner";
import EasterBanner from "@/components/EasterBanner";
import { useAuth } from "@/lib/auth-context";
import { trackNavigation } from "@/lib/track-navigation";

const Index = () => {
  const [activeFilter, setActiveFilter] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { user } = useAuth();

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setSearchQuery("");
    setCategoryFilter("all");
    if (user) trackNavigation(user.uid, filter, user.email || undefined);
  };

  return (
    <div className="min-h-screen bg-background flex overflow-x-hidden max-w-[100vw]">
      <Sidebar onFilterChange={handleFilterChange} activeFilter={activeFilter} onShowSubscription={() => setShowSubscriptionModal(true)} />

      <div className="flex-1 md:ml-[72px] flex flex-col min-w-0 overflow-x-hidden">
        <TopHeader
          onFilterChange={handleFilterChange}
          activeFilter={activeFilter}
          onSearch={(q) => {
            setSearchQuery(q);
            setActiveFilter("search");
          }}
        />

        <main className="flex-1 pt-14 px-2 md:px-4 lg:px-5 overflow-x-hidden">
          <nav className="md:hidden flex gap-2 overflow-x-auto scrollbar-hide py-2" aria-label="Mobile categories">
            {[["home", "Home"], ["movies", "Movies"], ["series", "Series"], ["anime", "Anime"], ["music", "Music"], ["top-rated", "Top Rated"]].map(([filter, label]) => <Button key={filter} size="sm" variant={activeFilter === filter ? "default" : "secondary"} className="shrink-0 h-7 rounded-full text-[11px] px-3" onClick={() => handleFilterChange(filter)}>{label}</Button>)}
          </nav>
          {activeFilter === "home" && (
            <div className="space-y-3">
              <HeroCarousel />
              <a
                href="tel:+256773566069"
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-primary-foreground bg-gradient-to-r from-primary to-accent shadow-md hover:opacity-90 transition"
              >
                <span>📞</span>
                <span>Contact Support: 0773566069</span>
              </a>
              <Link
                to="/agent"
                className="relative flex items-center justify-between gap-2 w-full py-3 px-4 rounded-xl text-sm font-bold border border-agent/50 bg-agent/10 text-foreground hover:bg-agent/20 transition"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-agent" />
                  Agent Zone — new titles first
                </span>
                <span className="text-xs font-bold text-agent">Open →</span>
              </Link>
              <EasterBanner />
              <SubscriberStatusBanner onUpgrade={() => setShowSubscriptionModal(true)} />
              <CategoriesRow
                onSelectCategory={setCategoryFilter}
                activeCategory={categoryFilter}
              />
            </div>
          )}
          <PopularGrid
            activeFilter={activeFilter}
            searchQuery={searchQuery}
            categoryFilter={categoryFilter}
            onShowSubscription={() => setShowSubscriptionModal(true)}
            onRequireAuth={() => setShowAuthModal(true)}
          />
        </main>

        <MobileNav onFilterChange={handleFilterChange} activeFilter={activeFilter} onShowSubscription={() => setShowSubscriptionModal(true)} />
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />

      <NewContentToast />
      <AgentBanner onUpgrade={() => setShowSubscriptionModal(true)} />

    </div>
  );
};

export default Index;
