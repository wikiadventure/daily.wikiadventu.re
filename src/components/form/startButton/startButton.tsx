"use client"
import {  useGameFormStore, type GameFormState } from "@/composables/gameForm"
import { type LangCode } from "@/i18n/lang";
import { useTranslations, type Translations } from "@/composables/useTranslation";
import "./startButton.css";
import { useGamePlayStore } from "@/composables/gamePlay";
import { createRoot } from "react-dom/client";
import { useState, useEffect } from "react";
import { WikiPlayground } from "@/components/wiki/wikiPlayground/WikiPlayground";
import { useShallow } from "zustand/react/shallow";
import { format } from "date-fns/format";

export function StartButton({ lang }: { lang: LangCode }) {
    const { startPage, endPage } = useGameFormStore(
        useShallow((state) => ({
            startPage: state.startPage,
            endPage: state.endPage,
        } satisfies Partial<GameFormState>)),   
    );
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => {
                setErrorMessage(null);
            }, 15000);

            return () => clearTimeout(timer);
        }
    }, [errorMessage]);
    
    type StartButtonTranslation = {
        start: string
    }

    const translations:Translations<StartButtonTranslation> = {
        en: {
            start: "Start"
        },
        fr: {
            start: "Commencer"
        },
        de: {
            start: "Start"
        },
        eo: {
            start: "Komenco"
        },
    };

    function onClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        e.preventDefault();
        start();
    }
    

    async function start() {
        const { wikiLang, dailyDate, reverse, startPage, endPage } = useGameFormStore.getState();
        const gameplayStore = useGamePlayStore.getState();
        gameplayStore.setStartPage(startPage!);
        gameplayStore.setEndPage(endPage!);
        gameplayStore.setDailyDate(dailyDate);
        gameplayStore.setWikiLang(wikiLang);
        gameplayStore.setReverse(reverse);
        const container = document.querySelector(".Home.play");
        if (container && !container.hasChildNodes()) {
            const root = createRoot(container);
            root.render(<WikiPlayground />);
        }
        document.querySelector(".Home.select")?.classList.add("display-none-during-play");
        const queryParams = new URLSearchParams({
            wikiLang,
            dailyDate: format(dailyDate, "yyyy.MM.dd"),

            startPage: startPage?.title?.replaceAll(" ", "_") ?? "",
            endPage: endPage?.title?.replaceAll(" ", "_") ?? "",
        });
        if (reverse) queryParams.set("reverse", "1");
        const url = window.location.pathname+"?"+queryParams.toString();
        console.log(url);
        window.history.pushState({},"", url);
    }

    const { t } = useTranslations(lang, translations);

    return (
        <>  
            <div className="start-button">
                <button onClick={onClick} disabled={startPage == null && endPage == null}>
                    { t("start") }
                </button>
                {errorMessage && (
                <p>{errorMessage}</p>
                )}
            </div>


        </>
    )
}
