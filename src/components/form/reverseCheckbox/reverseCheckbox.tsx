"use client"
import {  useGameFormStore, type GameFormState } from "@/composables/gameForm"
import { type LangCode } from "@/i18n/lang";
import { useTranslations, type Translations } from "@/composables/useTranslation";
import "./reverseCheckbox.css";
import { useShallow } from "zustand/react/shallow";

export function ReverseCheckbox({ lang }: { lang: LangCode }) {
    const { reverse, setReverse } = useGameFormStore(
        useShallow((state) => ({
            reverse: state.reverse,
            setReverse: state.setReverse,
        } satisfies Partial<GameFormState>)),   
    );
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
