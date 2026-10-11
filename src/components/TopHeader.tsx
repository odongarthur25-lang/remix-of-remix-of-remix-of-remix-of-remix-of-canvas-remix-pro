import { useState } from "react";
import { Search, User, LogOut, Download, Sun, Moon } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import NotificationBell from "./NotificationBell";

interface TopHeaderProps {
  onFilterChange?: (filter: string) => void;
  activeFilter?: string;
  onSearch?: (query: string) => void;
}

export default function TopHeader({ onSearch, onFilterChange, activeFilter }: TopHeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { canInstall, install } = usePwaInstall();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      onSearch?.(searchQuery.trim());
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setShowUserMenu(false);
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 md:left-[72px] right-0 h-14 z-30 grid grid-cols-[minmax(0,1fr)_auto] sm:flex items-center px-3 md:px-5 gap-2 bg-card border-b border-border"

    >
      {/* Logo */}
      <div className="flex min-w-0 items-center gap-2 shrink-0">
        <img
          src="https://i.postimg.cc/Fs2nssw-m/logo.png"
          alt="LUO CINEMA"
          className="w-8 h-8 drop-shadow-md"
        />
        <span className="font-extrabold text-sm text-foreground truncate font-display">
          DIMPOZ MOVIES
        </span>
      </div>

      {onFilterChange && <nav className="hidden lg:flex items-center gap-1 shrink-0" aria-label="Catalog">
        {[["movies", "Movies"], ["series", "TV Shows"], ["anime", "Anime"]].map(([filter, label]) => <Button key={filter} variant="ghost" size="sm" className={activeFilter === filter ? "text-primary" : "text-foreground"} onClick={() => onFilterChange(filter)}>{label}</Button>)}
      </nav>}
      {/* Search */}
      <form onSubmit={handleSearch} className="hidden sm:block min-w-0 flex-1 max-w-xs ml-auto">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search movies, series..."
            className="w-full h-9 pl-9 pr-3 bg-secondary/60 border border-border/50 rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-secondary transition-all"
          />
        </div>
      </form>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
        <Button variant="ghost" size="icon" className="h-8 w-8 sm:hidden" aria-label="Search" onClick={() => navigate("/search")}><Search /></Button>
        <NotificationBell />
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleTheme} aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"} title={theme === "dark" ? "Light mode" : "Dark mode"}>{theme === "dark" ? <Sun /> : <Moon />}</Button>
        {canInstall && <Button
          onClick={() => install()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/90 hover:bg-accent text-accent-foreground rounded-xl text-[11px] font-semibold transition-all shadow-sm hover:shadow-md"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Install</span>
        </Button>}

        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center justify-center w-8 h-8 rounded-xl hover:bg-secondary/80 transition overflow-hidden ring-2 ring-border/30"
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-8 h-8 rounded-xl object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
            </button>

            {showUserMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-52 bg-card border border-border rounded-xl shadow-2xl p-1.5 z-50">
                  <div className="px-3 py-2 mb-1">
                    <p className="text-[11px] font-medium text-foreground truncate">{user.displayName || "User"}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <div className="h-px bg-border/50 mx-2 mb-1" />
                  <button
                    onClick={() => { navigate("/settings"); setShowUserMenu(false); }}
                    className="w-full px-3 py-2 text-xs text-foreground hover:bg-secondary rounded-lg text-left transition"
                  >
                    Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full px-3 py-2 text-xs text-accent hover:bg-accent/10 rounded-lg text-left flex items-center gap-2 transition"
                  >
                    <LogOut className="w-3 h-3" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-1.5 bg-primary hover:opacity-90 text-primary-foreground rounded-xl text-[11px] font-bold transition shadow-sm"
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
}
