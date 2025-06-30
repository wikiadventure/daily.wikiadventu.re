import type { LangCode } from "@/i18n/lang";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const dailyAvailableIn = [
    "en",
    "fr",
    "de",
    "eo"
] as const satisfies LangCode[];

export type DailyWikiLang = typeof dailyAvailableIn[number];

export interface GameFormState {
    dailyDate: Date;
    setDailyDate: (date: Date) => void;
    wikiLang: DailyWikiLang;
    setWikiLang: (lang: DailyWikiLang) => void;
    reverse: boolean;
    setReverse: (b: boolean) => void;
}

export function defaultWikiLang(AstroRequest?: { url: string }): DailyWikiLang {
    if (typeof document !== "undefined") {
        const currentUrl = document.location.pathname;
        const parsedLocal = currentUrl.split("/").at(1);
        return (dailyAvailableIn.includes(parsedLocal as DailyWikiLang) ? parsedLocal : "en") as DailyWikiLang;
    } else if (AstroRequest) {
        const currentUrl = new URL(AstroRequest.url).pathname;
        const parsedLocal = currentUrl.split("/").at(1);
        return (dailyAvailableIn.includes(parsedLocal as DailyWikiLang) ? parsedLocal : "en") as DailyWikiLang;
    }
    return "en";
}

export const useGameFormStore = create(persist(
    (set, get) => ({
        dailyDate: null as unknown as Date,
        setDailyDate: (date: Date) => 
            set((state:GameFormState) => ({ ...state, dailyDate: date }) satisfies GameFormState),

        wikiLang: null as unknown as DailyWikiLang,
        setWikiLang: (lang: DailyWikiLang) => {
            lang && 
            set((state:GameFormState) => ({ ...state, wikiLang: lang }) satisfies GameFormState);
        },

        reverse: false,
        setReverse: (b: boolean) => 
            set((state:GameFormState) => ({ ...state, reverse: b }) satisfies GameFormState),

    }) satisfies GameFormState,
    {
        name: "wikiLangStorage", // Key for localStorage
        partialize: (
            state: GameFormState
        ) => ({ wikiLang: state.wikiLang }), // Persist only wikiLang
    }
));