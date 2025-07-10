import { create } from "zustand";
import type { DailyWikiLang, GameFormState } from "./gameForm";
import type { WikiContentPreview } from "./useWiki";

export type GamePlayState = GameFormState & {

    history: string[];
    historyPush: (e: string) => void;

    timerTime: number;
    timerStart: () => void;
    timerPause: () => void;
    timerReset: () => void;
    timerFormatTime: (t: number) => string;
};

export const useGamePlayStore = create<GamePlayState>(
    (set, get) => {
        let timerTime = 0;
        let isRunning = false;
        let startTimeRef: number | null = null;
        let animationFrameRef: number | null = null;

        function updateTimer() {
            if (startTimeRef !== null) {
                const elapsed = Math.floor((performance.now() - startTimeRef) / 1000);
                timerTime = elapsed;
                set((state: GamePlayState) => ({ ...state, timerTime }));
                animationFrameRef = requestAnimationFrame(updateTimer);
            }
        }

        function timerStart() {
            if (!isRunning) {
                isRunning = true;
                startTimeRef = performance.now() - timerTime * 1000;
                animationFrameRef = requestAnimationFrame(updateTimer);
            }
        }

        function timerPause() {
            if (isRunning) {
                isRunning = false;
                if (animationFrameRef !== null) {
                    cancelAnimationFrame(animationFrameRef);
                    animationFrameRef = null;
                }
            }
        }

        function timerReset() {
            isRunning = false;
            timerTime = 0;
            set((state: GamePlayState) => ({ ...state, timerTime }));
            if (animationFrameRef !== null) {
                cancelAnimationFrame(animationFrameRef);
                animationFrameRef = null;
            }
        }

        function timerFormatTime(t: number) {
            const min = Math.floor(t / 60);
            const minS = min > 0 ? min + "m" : "";
            const secS = t % 60 + "s";
            return minS + secS;
        }

        return {
            dailyDate: null as unknown as Date,
            setDailyDate: (date: Date) =>
                set((state: GamePlayState) => ({ ...state, dailyDate: date }) satisfies GamePlayState),

            wikiLang: null as unknown as DailyWikiLang,
            setWikiLang: (lang: DailyWikiLang) => {
                set((state: GamePlayState) => ({ ...state, wikiLang: lang }) satisfies GamePlayState);
            },

            reverse: false,
            setReverse: (b: boolean) =>
                set((state: GamePlayState) => ({ ...state, reverse: b }) satisfies GamePlayState),

            startPage: null as WikiContentPreview|null,
            setStartPage: (s: WikiContentPreview|null) =>
                set((state: GamePlayState) => ({ ...state, startPage: s }) satisfies GamePlayState),

            endPage: null as WikiContentPreview|null,
            setEndPage: (e: WikiContentPreview|null) =>
                set((state: GamePlayState) => ({ ...state, endPage: e }) satisfies GamePlayState),

            history: [],
            historyPush: (e: string) => {
                set((state: GamePlayState) => ({ ...state, history: [...state.history, e] }) satisfies GamePlayState);
            },

            timerTime,
            timerStart,
            timerPause,
            timerReset,
            timerFormatTime,
        } satisfies GamePlayState;
    }
);