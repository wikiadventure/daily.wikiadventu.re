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

export function defaultWikiLang(): DailyWikiLang {
    if (typeof document !== "undefined") {
        const currentUrl = document.location.pathname;
        const parsedLocal = currentUrl.split("/").at(1);
        console.log({parsedLocal});
        return (dailyAvailableIn.includes(parsedLocal as DailyWikiLang) ? parsedLocal : "en") as DailyWikiLang;
    }
    return "en";
}

export const useGameFormStore = create(persist(
    (set, get) => ({
        dailyDate: null as unknown as Date,
        setDailyDate: (date: Date) => 
            set((state:GameFormState) => ({ ...state, dailyDate: date }) satisfies GameFormState),

        wikiLang: defaultWikiLang() as DailyWikiLang,
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


const globalDateCache: Partial<Record<LangCode, Date[]>> = {};

export async function fetchAvailableDates(lang: LangCode): Promise<Date[]> {
    if (globalDateCache[lang]) {
        return globalDateCache[lang];
    }

    const response = await fetch(`/daily/${lang}/available`);
    const text = await response.text();
    const dates = 
        text.split("\n")
            .map(dateStr => {
                const [year, month, day] = dateStr.split("/").map(Number);
                return new Date(year, month - 1, day); // Month is zero-based
            });

    globalDateCache[lang] = dates;
    return dates;
}