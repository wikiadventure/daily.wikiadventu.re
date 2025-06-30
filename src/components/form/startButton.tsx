"use client"
import {  useGameFormStore } from "@/composables/gameForm"
import { type LangCode } from "@/i18n/lang";
import { useTranslations, type Translations } from "@/composables/useTranslation";
import { format } from "date-fns";
import "./startButton.css";
import { useGamePlayStore } from "@/composables/gamePlay";
import { WikiPlayground } from "../wiki/WikiPlayground";
import { createRoot } from "react-dom/client";

export function StartButton({ lang }: { lang: LangCode }) {
    const { wikiLang, dailyDate, reverse } = useGameFormStore();
    const gameplayStore = useGamePlayStore();
    
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
    

    function start() {
        const formatDate = format(dailyDate, "yyyy/MM/dd");

        const url = `/daily/${wikiLang}/${formatDate}`;
        console.log("url : ", url);
        fetch(url, {
            redirect: "error"
        })
            .then(async r => {return { text: await r.text(), res: r}})
            .then(r => {
                const { res, text } = r;
                if (!res.ok || text.startsWith("<!DOCTYPE html>")) {
                    console.error("ERROR : ");
                    console.error(res);
                    console.error(text);
                    return;
                }
                let [startPage, endPage] = text.split(/\r*\n/g);
                if (reverse) [startPage, endPage] = [endPage, startPage];
                gameplayStore.setStartPage(decodeURIComponent(startPage));
                gameplayStore.setEndPage(decodeURIComponent(endPage));
                gameplayStore.setDailyDate(dailyDate);
                gameplayStore.setWikiLang(wikiLang);
                gameplayStore.setReverse(reverse);

                // here
                const container = document.querySelector(".Home.play");
                if (container && !container.hasChildNodes()) {
                    const root = createRoot(container);
                    root.render(<WikiPlayground />);
                }
                document.querySelector(".Home.select")?.classList.add("display-none-during-play");
            })
    }

    const { t } = useTranslations(lang, translations);

    return (
        <button className="start-button" onClick={onClick}>
            { t("start") }
        </button>
    )
}
