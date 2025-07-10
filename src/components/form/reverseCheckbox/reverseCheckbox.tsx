"use client"
import {  useGameFormStore } from "@/composables/gameForm"
import { type LangCode } from "@/i18n/lang";
import { useTranslations, type Translations } from "@/composables/useTranslation";
import "./reverseCheckbox.css";

export function ReverseCheckbox({ lang }: { lang: LangCode }) {
    const { reverse, setReverse } = useGameFormStore();
    type ReverseCheckboxTranslation = {
        reverse: string
    }

    const translations:Translations<ReverseCheckboxTranslation> = {
        en: {
            reverse: "reverse"
        },
        fr: {
            reverse: "inversé"
        },
        de: {
            reverse: "umkehren"
        },
        eo: {
            reverse: "inversigi"
        },
    };

    const { t } = useTranslations(lang, translations);

    return (
        <label className="reverse-checkbox">
            <p>{ t("reverse") }</p>
            <input type="checkbox" checked={reverse} onChange={(e) => {
                setReverse(e.target.checked);
            }} />      
        </label>
    )
}
