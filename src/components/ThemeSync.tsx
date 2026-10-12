import { useTheme } from "@/hooks/use-theme";

/** Mounts the theme hook once app-wide so the dark class applies on every page. */
const ThemeSync = () => {
  useTheme();
  return null;
};

export default ThemeSync;
