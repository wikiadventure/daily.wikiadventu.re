import "./themePicker.css";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useThemeStore } from "@/composables/useTheme";
import { useTranslations, type Translations } from "@/composables/useTranslation";
import { lang } from "@/i18n/currentLang";
import IconDark  from "~icons/material-symbols/dark-mode-outline-rounded";
import IconLight from "~icons/material-symbols/light-mode-rounded";
import IconOs from "~icons/material-symbols/settings-night-sight-outline-rounded";

export function ThemePicker() {
	const { theme, setTheme } = useThemeStore();
	type ThemePickerTranslation = {
		light: string,
		dark: string,
		system: string
	}

	const translations:Translations<ThemePickerTranslation> = {
		en: {
			light: "Light",
			dark: "Dark",
			system: "System",
		},
		fr: {
			light: "Clair",
			dark: "Obscure",
			system: "Système",
		},
		de: {
			light: "Hell",
			dark: "Dunkel",
			system: "System",
		},
		eo: {
			light: "Luma",
			dark: "Malhela",
			system: "Sistemo",
		},
	};

	const { t } = useTranslations(lang, translations);

	return (
		<Select onValueChange={(value) => setTheme(value as any)} value={theme}>
			<SelectTrigger aria-label="Theme select" className="theme-picker select">
				<SelectValue defaultValue="os" />
			</SelectTrigger>
			<SelectContent align="end" className="theme-picker pop-up">
				<SelectItem value="light"><IconLight/><span>{t('light')}</span></SelectItem>
				<SelectItem value="dark"> <IconDark/> <span>{t('dark')}</span></SelectItem>
				<SelectItem value="os">   <IconOs/>   <span>{t('system')}</span></SelectItem>
			</SelectContent>
		</Select>
	);
}
