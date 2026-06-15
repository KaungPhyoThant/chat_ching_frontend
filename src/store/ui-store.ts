import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark";
export type Locale = "en" | "my";
export type NavLayout = "sidebar" | "menubar";

interface UIState {
  theme: ThemeMode;
  locale: Locale;
  navLayout: NavLayout;
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  setNavLayout: (navLayout: NavLayout) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: "light",
      locale: "en",
      navLayout: "menubar",
      sidebarCollapsed: false,
      commandPaletteOpen: false,
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
      setLocale: (locale) => set({ locale }),
      toggleLocale: () =>
        set((s) => ({ locale: s.locale === "en" ? "my" : "en" })),
      setNavLayout: (navLayout) => set({ navLayout }),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
      toggleCommandPalette: () =>
        set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),
    }),
    {
      name: "app-ui",
      partialize: (state) => ({
        theme: state.theme,
        locale: state.locale,
        navLayout: state.navLayout,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    },
  ),
);
