import { create } from "zustand";

type Theme = "light" | "dark" | "os";

interface ThemeState {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	initTheme: () => void;
}

function getUserColorScheme() {
    if (typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
        return 'dark-os';
    }
    return 'light-os';
}


export const useThemeStore = create<ThemeState>((set) => ({
	theme: "os",
	setTheme: (newTheme) => {
		if (typeof window !== "undefined") {
			if (newTheme == "os") localStorage.removeItem("theme");
            else localStorage.setItem("theme", newTheme);
			document.body.setAttribute("data-theme", newTheme == "os" ? getUserColorScheme() : newTheme);
		}
		set({ theme: newTheme });
	},
	initTheme: () => {
		if (typeof window !== "undefined") {
			const storedTheme = (localStorage.getItem("theme") as Theme) || "os";
			document.body.setAttribute("data-theme", storedTheme == "os" ? getUserColorScheme() : storedTheme);
			set({ theme: storedTheme });
		}
	},
}));