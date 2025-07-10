"use client";
import { useGamePlayStore } from "@/composables/gamePlay";
import { WikiPage } from "../wikiPage/wikiPage";
import "./WikiPlayground.css";
import { lang } from "@/i18n/currentLang";
import { memo, useEffect, useRef } from "react";
import type { LangCode } from "@/i18n/lang";
import { useMount } from "@/composables/useMount";

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
        wikiLang, startPage, endPage, historyPush,
        timerTime, timerStart, timerPause, timerFormatTime 
    } = useGamePlayStore();

    useMount(() => {
        timerStart();
    });

    function onWikiLink(link: string) {
        historyPush(link);
        console.log("LINK", link);
        console.log("ENDPAGE", endPage?.title!);
        console.log("EQUAL", link == endPage?.title!);
        if (link == endPage?.title!) {
            onWin();
        }
    }

    function onWin() {
        timerPause();
        const { wikiLang, history, timerTime: time } = useGamePlayStore.getState();
        window.location.href = `/${lang}/result/${wikiLang}wiki?time=${time}&path=${history.map(s => encodeURIComponent(s)).join("|")}`;
    }

    return (
        <div className="wiki-playground">
            <div className="time-elapsed">{timerFormatTime(timerTime)}</div>
            <WikiStartEndPages startPage={startPage?.title!} endPage={endPage?.title!} onWikiLink={onWikiLink} wikiLang={wikiLang} />
        </div>
    )
}
