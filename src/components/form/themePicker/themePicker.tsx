import "./themePicker.css";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useThemeStore } from "@/composables/useTheme";
import IconDark  from "~icons/material-symbols/dark-mode-outline-rounded";
import IconLight from "~icons/material-symbols/light-mode-rounded";
import IconOs from "~icons/material-symbols/settings-night-sight-outline-rounded";

export function ThemePicker() {
	const { theme, setTheme } = useThemeStore();

	return (
		<Select onValueChange={(value) => setTheme(value as any)} value={theme}>
			<SelectTrigger aria-label="Theme select" className="theme-picker select">
				<SelectValue placeholder="Theme" />
			</SelectTrigger>
			<SelectContent align="end" className="theme-picker pop-up">
				<SelectItem value="light"><IconLight/><span>Light</span></SelectItem>
				<SelectItem value="dark"> <IconDark/> <span>Dark </span></SelectItem>
				<SelectItem value="os">   <IconOs/>   <span>OS   </span></SelectItem>
			</SelectContent>
		</Select>
	);
}
