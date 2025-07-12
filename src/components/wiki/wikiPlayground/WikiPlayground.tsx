"use client";
import "./WikiPlayground.css";
import { useGamePlayStore, type GamePlayState } from "@/composables/gamePlay";
import { WikiPage } from "../wikiPage/wikiPage";
import { lang } from "@/i18n/currentLang";
import { memo, useEffect, useRef } from "react";
import type { LangCode } from "@/i18n/lang";
import { useMount } from "@/composables/useMount";
import { useShallow } from "zustand/react/shallow";

function WikiStartEndPagesRaw(
    { startPage, endPage, onWikiLink, wikiLang }:
        { startPage: string, endPage: string, onWikiLink: (s: string) => void, wikiLang:LangCode }
) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleKeyPress(event: KeyboardEvent) {
            if (event.ctrlKey && event.altKey && event.code === "Space") {
                const container = containerRef.current;
                if (container) {
                    const isScrolledToLeft = container.scrollLeft === 0;
                    const isScrolledToRight = container.scrollLeft >= container.scrollWidth - container.clientWidth;

                    if (isScrolledToLeft) {
                        container.scrollTo({ left: container.scrollWidth, behavior: "smooth" });
                    } else if (isScrolledToRight) {
                        container.scrollTo({ left: 0, behavior: "smooth" });
                    }
                }
            }
        }

        window.addEventListener("keydown", handleKeyPress);
        return () => {
            window.removeEventListener("keydown", handleKeyPress);
        };
    }, []);

    return (
        <div className="scroll-snap-dual-panel" ref={containerRef}>
            <WikiPage
                disable={false}
                title={"find : " + endPage}
                onWikiLink={(e) => onWikiLink(e)}
                initialPage={startPage}
                wikiLang={wikiLang}
            />
            <WikiPage
                disable={true}
                title="End page!"
                onWikiLink={() => { }}
                initialPage={endPage}
                wikiLang={wikiLang}
            />
        </div>
    );
}

const WikiStartEndPages = memo(WikiStartEndPagesRaw, (p, n) => {
    return p.startPage == n.startPage && p.endPage == n.endPage;
    // onWikiLink is never equal to the previous one
    // p.startPage != n.startPage && console.log("START DIFFERENT : ", p.startPage, n.startPage);
    // p.endPage != n.endPage && console.log("END DIFFERENT : ", p.endPage, n.endPage);
    // p.onWikiLink != n.onWikiLink && console.log("onWikiLink DIFFERENT : ", p.onWikiLink, n.onWikiLink);
    // return true;
});

export function WikiPlayground() {
    const {
        wikiLang, startPage, endPage,
        reverse, timerTime, timerFormatTime 
    } = useGamePlayStore(
        useShallow((state) => ({
            wikiLang: state.wikiLang,
            startPage: state.startPage,
            endPage: state.endPage,
            reverse: state.reverse,
            timerTime: state.timerTime,
            timerFormatTime: state.timerFormatTime,
        } satisfies Partial<GamePlayState>)), 
    );

    useMount(() => {
        useGamePlayStore.getState().timerStart();
    });

    const [start, end] = reverse ? [endPage?.title!, startPage?.title!] : [startPage?.title!, endPage?.title!];

    function onWikiLink(link: string) {
        useGamePlayStore.getState().historyPush(link);
        if (link == end) {
            onWin();
        }
    }

    function onWin() {
        const { wikiLang, history, timerTime: time, timerPause } = useGamePlayStore.getState();
        timerPause();
        window.location.href = `/${lang}/result/${wikiLang}wiki?time=${time}&path=${history.map(s => encodeURIComponent(s.replaceAll(" ", "_"))).join("|")}`;
    }

    

    return (
        <div className="wiki-playground">
            <div className="time-elapsed">{timerFormatTime(timerTime)}</div>
            <WikiStartEndPages startPage={start} endPage={end} onWikiLink={onWikiLink} wikiLang={wikiLang} />
        </div>
    )
}
