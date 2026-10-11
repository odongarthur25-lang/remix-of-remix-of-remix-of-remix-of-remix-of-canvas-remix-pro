import { Home, Film, Tv, Music, Star, CreditCard, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useNavigate, useLocation } from "react-router-dom";

interface MobileNavProps {
  onFilterChange?: (filter: string) => void;
  activeFilter?: string;
  onShowSubscription?: () => void;
}

export default function MobileNav({ onFilterChange, activeFilter = "home", onShowSubscription }: MobileNavProps) {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Home", filter: "home", path: "/" },
    { icon: Film, label: "Movies", filter: "movies", path: "/" },
    { icon: Tv, label: "Series", filter: "series", path: "/" },
    { icon: Music, label: "Music", filter: "music", path: "/" },
    { icon: Star, label: "Top", filter: "top-rated", path: "/" },
    { icon: CreditCard, label: "Plans", filter: "subscription", path: "modal" },
  ];

  const handleClick = (item: typeof navItems[0]) => {
    if (item.path === "modal") { onShowSubscription?.(); return; }
    if (item.path === "/" && location.pathname === "/") {
      onFilterChange?.(item.filter);
    } else if (item.path !== "/") {
      navigate(item.path);
    } else {
      navigate("/");
      setTimeout(() => onFilterChange?.(item.filter), 100);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 md:hidden z-40 pb-[env(safe-area-inset-bottom)] bg-card border-t border-border">
      <div className="relative flex items-center justify-between gap-0 px-1 py-1 mx-auto max-w-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeFilter === item.filter;
          return (
            <Button
              variant="ghost"
              key={item.label}
              onClick={() => handleClick(item)}
              className="relative flex flex-col items-center justify-center gap-0.5 flex-1 h-11 px-0 py-1 rounded-none"
            >
              <Icon
                className={`w-[18px] h-[18px] transition-all duration-200 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
                strokeWidth={isActive ? 2.6 : 1.8}
              />
              <span
                className={`text-[9px] font-bold tracking-wide transition-all duration-200 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
            </Button>
          );
        })}
        {isAdmin && (
          <Button variant="ghost"
            onClick={() => navigate("/admin")}
            className="relative flex flex-col items-center justify-center gap-0.5 flex-1 py-2 rounded-full"
          >
            <Shield className="w-[18px] h-[18px] text-muted-foreground" strokeWidth={1.8} />
            <span className="text-[9px] font-bold tracking-wide text-muted-foreground">Admin</span>
          </Button>
        )}
      </div>
    </div>
  );
}
