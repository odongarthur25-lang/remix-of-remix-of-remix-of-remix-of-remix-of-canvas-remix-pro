import { Home, Film, Tv, Music, Star, CreditCard, Shield, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { Sun, Moon } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  onFilterChange: (filter: string) => void;
  activeFilter: string;
  onShowSubscription?: () => void;
}

const navItems = [
  { icon: Home, label: "Home", filter: "home" },
  { icon: Film, label: "Movies", filter: "movies" },
  { icon: Tv, label: "Series", filter: "series" },
  { icon: Music, label: "Music", filter: "music" },
  { icon: Star, label: "Top Rated", filter: "top-rated" },
  { icon: CreditCard, label: "Plans", filter: "subscription" },
  { icon: Settings, label: "Settings", filter: "settings" },
];

export default function Sidebar({ onFilterChange, activeFilter, onShowSubscription }: SidebarProps) {
  const { theme, toggleTheme } = useTheme();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleClick = (filter: string) => {
    if (filter === "settings") { navigate("/settings"); return; }
    if (filter === "subscription") { onShowSubscription?.(); return; }
    onFilterChange(filter);
  };

  return (
    <div className="fixed left-0 top-0 h-full w-[72px] flex-col items-center py-4 z-40 hidden md:flex bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="mb-6 mt-1">
        <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center shadow-lg shadow-primary/20 relative">
          <img
            src="https://i.postimg.cc/Fs2nssw-m/logo.png"
            alt="Logo"
            className="w-6 h-6"
          />

        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col items-center gap-0.5 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeFilter === item.filter;
          return (
            <Button variant="ghost"
              key={item.filter}
              onClick={() => handleClick(item.filter)}
              className="group relative flex flex-col items-center gap-0.5 py-2 px-2 h-12 w-full rounded-lg transition-all duration-200"
              style={
                isActive
                  ? { background: "hsl(var(--primary) / 0.12)" }
                  : {}
              }
              title={item.label}
            >
              {isActive && (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                  style={{ background: "hsl(var(--primary))" }}
                />
              )}
              <Icon
                className={`w-[18px] h-[18px] transition-all duration-200 ${
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                }`}
                strokeWidth={isActive ? 2.2 : 1.6}
              />
              <span className={`text-[8px] font-semibold transition-all duration-200 ${
                isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              }`}>
                {item.label}
              </span>
            </Button>
          );
        })}

        {isAdmin && (
          <>
            <div className="w-8 h-px bg-border/30 my-1" />
            <Button variant="ghost"
              onClick={() => navigate("/admin")}
              className="group flex flex-col items-center gap-0.5 py-2 px-2 h-12 w-full rounded-lg transition-all duration-200"
              title="Admin"
            >
              <Shield className="w-[18px] h-[18px] text-muted-foreground group-hover:text-accent transition-colors" strokeWidth={1.6} />
              <span className="text-[8px] font-semibold text-muted-foreground group-hover:text-accent transition-colors">Admin</span>
            </Button>
          </>
        )}
      </nav>
      <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>{theme === "dark" ? <Sun /> : <Moon />}</Button>
    </div>
  );
}
