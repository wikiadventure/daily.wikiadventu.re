"use client"
import {  useGameFormStore } from "@/composables/gameForm"
import { type LangCode } from "@/i18n/lang";
import { useTranslations, type Translations } from "@/composables/useTranslation";
import { format } from "date-fns";
import "./startButton.css";
import { useGamePlayStore } from "@/composables/gamePlay";
import { WikiPlayground } from "../wiki/WikiPlayground";
import { createRoot } from "react-dom/client";
import { useState, useEffect } from "react";
import { Alert } from "@/components/ui/alert";
import { getSeededRandomPages } from "@/composables/useWiki";

export function StartButton({ lang }: { lang: LangCode }) {
    const { wikiLang, dailyDate, reverse } = useGameFormStore();
    const gameplayStore = useGamePlayStore();
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

        function startPlaying(daily: {startPage:string, endPage:string}) {
            let [startPage, endPage] = [daily.startPage, daily.endPage];
            if (reverse) [startPage, endPage] = [endPage, startPage];
            gameplayStore.setStartPage(decodeURIComponent(startPage));
            gameplayStore.setEndPage(decodeURIComponent(endPage));
            gameplayStore.setDailyDate(dailyDate);
            gameplayStore.setWikiLang(wikiLang);
            gameplayStore.setReverse(reverse);
            const container = document.querySelector(".Home.play");
            if (container && !container.hasChildNodes()) {
                const root = createRoot(container);
                root.render(<WikiPlayground />);
            }
            document.querySelector(".Home.select")?.classList.add("display-none-during-play");
        }

        const formatDate = format(dailyDate, "yyyy/MM/dd");

        const url = `/daily/${wikiLang}/${formatDate}`;
        console.log("url : ", url);

        const daily = await fetch(url, {
            redirect: "error"
        })
            .then(async r => {return { text: await r.text(), res: r}})
            .then(r => {
                const { res, text } = r;
                if (!res.ok || text.startsWith("<!DOCTYPE html>")) {
                    console.error("ERROR : ");
                    console.error(res);
                    console.error(text);
                    
                    return null;
                }
                let [startPage, endPage] = text.split(/\r*\n/g);
                return { startPage, endPage };
            })
            .catch(e => {
                return null;
            });
        if (daily != null) return startPlaying(daily);
        if (new Date().getTime() - dailyDate.getTime() > 30 * 24 * 60 * 60 * 1000) {
            setErrorMessage("No daily set for this date. Can't generate a seeded random one for date older than 30 days");
            return;
        }
        const [start, end] = await getSeededRandomPages(wikiLang, dailyDate, formatDate, 2);
        startPlaying({ startPage: start.title, endPage: end.title });


    }

    const { t } = useTranslations(lang, translations);

    return (
        <>  
            <div className="start-button">
                <button onClick={onClick}>
                    { t("start") }
                </button>
                {errorMessage && (
                <p>{errorMessage}</p>
                )}
            </div>


        </>
    )
}
