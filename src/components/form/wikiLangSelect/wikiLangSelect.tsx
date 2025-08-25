"use client"
import "./wikiLangSelect.css";
import { dailyAvailableIn, defaultWikiLang, useGameFormStore, type GameFormState } from "@/composables/gameForm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { langs, type LangCode } from "@/i18n/lang";
import { useTranslations, type Translations } from "@/composables/useTranslation";
import { useMount } from "@/composables/useMount";
import { useShallow } from "zustand/react/shallow";

export function WikiLangSelect({ lang }: { lang: LangCode }) {
    const { wikiLang, setWikiLang } = useGameFormStore(
        useShallow((state) => ({
            wikiLang: state.wikiLang,
            setWikiLang: state.setWikiLang,
        } satisfies Partial<GameFormState>)),  
    );


    // Used to load default state after hydration
    useMount(() => {
        if (wikiLang == null) setWikiLang(defaultWikiLang());
    });

    type WikiLangSelectTranslation = {
        wikiLang: string,
        ariaLabel: string
    }

    const translations:Translations<WikiLangSelectTranslation> = {
        en: {
            wikiLang: "Wiki language",
            ariaLabel: "Wiki language select"
        },
        fr: {
            wikiLang: "Langue du Wiki",
            ariaLabel: "Sélection de la langue du Wiki"
        },
        de: {
            wikiLang: "Sprache des Wiki",
            ariaLabel: "Wiki-Sprachauswahl"
        },
        eo: {
            wikiLang: "Idioma Wiki",
            ariaLabel: "Elekto de lingvo de Vikio"
        },
    };

    const { t } = useTranslations(lang, translations);
    
    return (
        <Select value={wikiLang} onValueChange={(value) => setWikiLang(value as LangCode)} >
            <SelectTrigger className="wiki-lang-select" aria-label={t("ariaLabel")}>
                <label htmlFor="wikiLangInput">{t("wikiLang")}</label>
                {wikiLang && <SelectValue id="wikiLangInput"/>}
            </SelectTrigger>
            <SelectContent className="wiki-lang-select pop-up">
                {dailyAvailableIn.map(k => (
                    <SelectItem key={k} value={k}>
                        {langs[k]}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
