import type { LangCode } from "@/i18n/lang";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getSeededRandomPages, loadPreviews, type WikiContentPreview } from "./useWiki";
import { format } from "date-fns/format";

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

    startPage: WikiContentPreview|null;
    setStartPage: (s: WikiContentPreview|null) => void;

    endPage: WikiContentPreview|null;
    setEndPage: (s: WikiContentPreview|null) => void
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


let loadStartEndPageAbortController = new AbortController();

async function loadStartEndPage() {
    console.trace("loadStartEndPage");
    const  { dailyDate, wikiLang, setStartPage, setEndPage } = useGameFormStore.getState();
    setStartPage(null);
    setEndPage(null);

    loadStartEndPageAbortController.abort();
    loadStartEndPageAbortController = new AbortController();
    const signal = loadStartEndPageAbortController.signal;

    const formatDate = format(dailyDate, "yyyy/MM/dd");

    const url = `/daily/${wikiLang}/${formatDate}`;

    let daily = await fetch(url, {
        redirect: "error",
        signal
    })
        .then(async r => {return { text: await r.text(), res: r}})
        .then(r => {
            const { res, text } = r;
            if (!res.ok || res.status == 404) {                
                return null;
            }
            let [start, end] = text.split(/\r*\n/g);
            return {
                startPageTitle: decodeURIComponent(start).replaceAll("_"," "),
                endPageTitle: decodeURIComponent(end).replaceAll("_"," ")
            };
        })
        .catch(e => {
            // if (e.name === 'AbortError') {
            //     console.log('Fetch aborted');
            // }
            return null;
        });

    if (signal.aborted) return;

    if (daily == null) {
        const [start, end] = await getSeededRandomPages(wikiLang, dailyDate, formatDate, 2, signal);
        if (signal.aborted) return;
        daily = { startPageTitle: start.title, endPageTitle: end.title };
    }
    const { previews: wikiContentPreviews, response }  = await loadPreviews([daily.startPageTitle, daily.endPageTitle], wikiLang, signal);
    if (signal.aborted) return;
    const startPreviews = wikiContentPreviews.find(w=>w.title == daily.startPageTitle)!;
    const endPreviews   = wikiContentPreviews.find(w=>w.title == daily.endPageTitle)!;
    if (startPreviews == null || endPreviews == null) {
        alert("AAAAAAAAAAAAAHHHHHHH")
        console.error({startPreviews});
        console.error({endPreviews});
        console.error({response});
        console.error({wikiContentPreviews});
        console.error({daily});
        return;
    }
    setStartPage(startPreviews);
    setEndPage(endPreviews);

}

export const useGameFormStore = create(persist(
    (set, get) => ({
        dailyDate: null as unknown as Date,
        setDailyDate: (date: Date) => {
            if (get().dailyDate?.getTime() === date.getTime()) return;
            set((state:GameFormState) => ({ ...state, dailyDate: date }) satisfies GameFormState);
            console.log({date});
            loadStartEndPage();
        },

        wikiLang: defaultWikiLang() as DailyWikiLang,
        setWikiLang: (lang: DailyWikiLang) => {
            if (!lang || get().wikiLang === lang) return;
            set((state:GameFormState) => ({ ...state, wikiLang: lang }) satisfies GameFormState);
            console.log({lang});
            loadStartEndPage();
        },

        reverse: false,
        setReverse: (b: boolean) => 
            set((state:GameFormState) => ({ ...state, reverse: b }) satisfies GameFormState),

        startPage: null as WikiContentPreview|null,
        setStartPage: (b: WikiContentPreview|null) => 
            set((state:GameFormState) => ({ ...state, startPage: b }) satisfies GameFormState),

        endPage: null as WikiContentPreview|null,
        setEndPage: (b: WikiContentPreview|null) => 
            set((state:GameFormState) => ({ ...state, endPage: b }) satisfies GameFormState),

    }) satisfies GameFormState,
    {
        name: "wikiLangStorage", // Key for localStorage
        partialize: (
            state: GameFormState
        ) => ({ wikiLang: state.wikiLang }), // Persist only wikiLang
    }
));

async function resumeFromUrl() {
    if (typeof window == "undefined") return;
    console.log("RESUME FROM URL");
    const params = new URLSearchParams(window.location.search);

    const wikiLang = params.get("wikiLang") as DailyWikiLang | null;
    const dailyDateStr = params.get("dailyDate");
    const startPageTitle = params.get("startPage")?.replaceAll("_", " ");
    const endPageTitle = params.get("endPage")?.replaceAll("_", " ");
    const reverse = params.get("reverse") === "1";

    const newState: Partial<GameFormState> = {};

    if (wikiLang && dailyAvailableIn.includes(wikiLang)) {
        newState.wikiLang = wikiLang;
    }

    if (dailyDateStr) {
        const [year, month, day] = dailyDateStr.split(".").map(Number);
        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
            const date = new Date(year, month - 1, day);
            newState.dailyDate = date;
        }
    } else {
        newState.dailyDate = new Date(Date.UTC(
            new Date().getUTCFullYear(),
            new Date().getUTCMonth(),
            new Date().getUTCDate()
        ));
    }

    newState.reverse = reverse;
    useGameFormStore.setState(newState);
    // We split set state here to hydrate ui faster
    const newAsyncState: Partial<GameFormState> = {};

    if (startPageTitle && endPageTitle && wikiLang) {
        const { previews } = await loadPreviews([startPageTitle, endPageTitle], wikiLang);
        const startPage = previews.find(p => p.title === startPageTitle);
        const endPage = previews.find(p => p.title === endPageTitle);

        if (startPage) {
            newAsyncState.startPage = startPage;
            // setStartPage(startPage);
        }
        if (endPage) {
            newAsyncState.endPage = endPage;
            // setEndPage(endPage);
        }
    } else {
        await loadStartEndPage();
    }
    console.log("RESUME THIS :", {newAsyncState});
    useGameFormStore.setState(newAsyncState);
    console.log("GOT THAT :", useGameFormStore.getState());
}

resumeFromUrl();

const globalDateCache: Partial<Record<LangCode, Date[]>> = {};

export async function fetchAvailableDates(lang: LangCode): Promise<Date[]> {
    if (typeof window == "undefined") return [];
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