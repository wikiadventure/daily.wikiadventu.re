import { useState, useEffect, useRef } from "react";
import WikiPageContent from "./wikiPageContent";
import root from 'react-shadow';
import wikiPageCssString from "./wikiPage.css?inline";
import type { LangCode } from "@/i18n/lang";
import { useMount } from "@/composables/useMount";
import { useUpdate } from "@/composables/useUpdate";

interface WikiPageProps {
    disable: boolean;
    title: string;
    onWikiLink: (value: string) => void;
    initialPage: string;
    wikiLang: LangCode
}
export function WikiPage({ disable, title, onWikiLink, initialPage, wikiLang}:WikiPageProps) {
    const wikiRef = useRef<HTMLDivElement | null>(null);
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const [wikiPage, setWikiPage] = useState(new WikiPageContent());
    const [styleSheets, setStyleSheets] = useState<CSSStyleSheet[]>([]);
    const update = useUpdate();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 720);
    const [loading, setLoading] = useState(false);
    const [safeModeInterrupted, setSafeModeInterrupted] = useState(false);
    const [linkDisable, setLinkDisable] = useState(false);
    const [content, setContent] = useState("");

    useMount(() => {
        requestWikiPage(initialPage);
        if (wikiRef.current) {
            wikiRef.current.blur();
        }
    });

    useEffect(()=>{


        function effect() {
            const doc = wikiRef.current;
            if (doc == null || doc.childNodes.length == 0) {
                setTimeout(effect, 0);
                return;
            }
            const handleClick = (e: MouseEvent) => {
                const target = e.target as HTMLElement;
                if (target.tagName === "A" || target.tagName === "AREA") {
                    e.preventDefault();
                    e.stopPropagation();
                    onLinkClick(target as HTMLAnchorElement);
                }
            };

            doc.addEventListener("click", handleClick);
            
            redirectLinks();

        }
        effect();
    }, [wikiPage]);

    let isRequestingWikiPage = false;

    const requestWikiPage = async (url: string) => {
        if (isRequestingWikiPage) return;
        isRequestingWikiPage = true;
        setLoading(true);
        setSafeModeInterrupted(true);

        try {
            await fetchArticle(url, wikiLang);
            isRequestingWikiPage = false;
            setWikiPage(wikiPage);
            update();
            setTimeout(() => {
                onWikiLink(wikiPage.title);
                scrollRef.current?.scrollTo({top: 0, left: 0, behavior: "instant"});
                setLoading(false);
            }, 25);
        } catch (error) {
            console.error(error);
            setLoading(false);
            isRequestingWikiPage  = false;
        }
    };

    function redirectLinks() {
        const doc = wikiRef.current;
        if (doc == null) return;
        if (doc.childNodes.length == 0) {
            setTimeout(redirectLinks, 0); // Retry after a short delay
            return;
        }

        if (doc.getAttribute("data-has-been-redirected") == "true") return;
        doc.setAttribute("data-has-been-redirected", "true");
        

        const observer = new MutationObserver(() => {
            const links = doc.querySelectorAll("a, area");
            links.forEach((link) => {
                const href = link.getAttribute("href");
                const classes = link.classList;
                if (!href) return;

                if (href.startsWith("#")) {
                    classes.add("anchorLink");
                } else if (href.startsWith("/wiki/")) {
                    if (href.includes(":")) {
                        const sub = href.substring(6);
                        const decoded = decodeURI(sub).replace(/_/g, " ");
                        if (wikiPage.links.find((l) => l.title === decoded && l.ns === 0)) {
                            classes.add("wikiLink");
                        } else {
                            classes.add("portalLink");
                        }
                    } else {
                        classes.add("wikiLink");
                    }
                } else {
                    classes.add("notWikiLink");
                }
            });
        });
        
        observer.observe(doc, { childList: true, subtree: true });
        return;
    };

    const onLinkClick = (link: HTMLAnchorElement) => {
        const linkHref = link.getAttribute("href");
        if (!linkHref) return;

        if (!disable && link.classList.contains("wikiLink")) {
            let url = linkHref.substring(6);
            const anchorIndex = url.indexOf("#");
            if (anchorIndex !== -1) url = url.substring(0, anchorIndex);
            url = decodeURIComponent(url);

            requestWikiPage(url).then(() => {
                if (anchorIndex !== -1) scrollToAnchor(url.substring(anchorIndex + 1));
                else wikiRef.current?.scrollTo(0, 0);
            });
        } else if (linkHref.startsWith("#")) {
            scrollToAnchor(decodeURI(linkHref.substring(1)));
        }
    };

    const fetchArticle = async (title: string, wikiLang:LangCode) => {
        return await wikiPage.fetch(title, wikiLang, isMobile);
    };

    const scrollToAnchor = (id: string) => {
        scrollToID(id, wikiRef.current!);
    };

    const scrollToID = (id: string, scrollContainer?: HTMLElement | Document) => {
        if (!scrollContainer) scrollContainer = document;
        const element = scrollContainer.querySelector(`[id='${id}']`);
        if (element) element.scrollIntoView();
    };

    const safeRedirectLinks = () => {
        // if (wikiRef.current) {
        //     redirectLinks(wikiRef.current);
        // }
    };

    const safeScrollToID = (id: string) => {
        if (wikiRef.current) {
            scrollToID(id, wikiRef.current);
        }
    };

    const vectorHtmlClasses = [
        "vector-feature-language-in-header-enabled",
        "vector-feature-language-in-main-page-header-disabled",
        "vector-feature-page-tools-pinned-disabled",
        "vector-feature-toc-pinned-clientpref-1",
        "vector-feature-main-menu-pinned-disabled",
        "vector-feature-limited-width-clientpref-1",
        "vector-feature-limited-width-content-enabled",
        "vector-feature-custom-font-size-clientpref-1",
        "vector-feature-appearance-pinned-clientpref-1",
        "vector-feature-night-mode-enabled",
        "vector-toc-available",
        "vector-animations-ready",
        "ve-not-available",
        "skin-theme-clientpref-os",
        // "skin-theme-clientpref-night",
    ];

    const minervaHtmlClasses = [
        "skin-theme-clientpref-os",
        "mf-expand-sections-clientpref-0",
        "mf-font-size-clientpref-small",
        "mw-mf-amc-clientpref-0",
    ];

    const htmlClasses = isMobile ? minervaHtmlClasses : vectorHtmlClasses;

    useMount(() => {

        const convertToCSSStyleSheet = async (cssString: string): Promise<CSSStyleSheet> => {
            const sheet = new CSSStyleSheet();
            await sheet.replace(cssString);
            return sheet;
        };
        const loadStyleSheets = async () => {

            const desktopModules = [
                "ext.cite.styles",
                "ext.relatedArticles.styles",
                "ext.kartographer.style",
                "ext.timeline.styles",
                "ext.uls.interlanguage",
                "ext.visualEditor.desktopArticleTarget.noscript",
                "ext.wikimediaBadges",
                "ext.wikimediamessages.styles",
                "mediawiki.page.gallery.styles",
                "mediawiki.hlist",
                "skins.vector.search.codex.styles",
                "skins.vector.styles",
                "skins.vector.icons",
                "wikibase.client.init",
                "skins.vector.icons,styles",
                "site.styles"
            ];

            const mobileModules = [
                "ext.cite.styles",
                "ext.kartographer.style",
                "ext.timeline.styles",
                "ext.uls.interlanguage",
                "ext.relatedArticles.styles",
                "ext.wikimediaBadges",
                "ext.wikimediamessages.styles",
                "mobile.init.styles",
                "mediawiki.page.gallery.styles",
                "mediawiki.hlist",
                "wikibase.client.init",
                "site.styles",
                "skins.minerva.codex.styles",
                "skins.minerva.content.styles.images",
                "skins.minerva.icons,styles",
                "ext.gadget.Mobile",
            ];

            const modules = isMobile ? mobileModules : desktopModules;
            const skin = isMobile ? 'minerva' : 'vector-2022';

            const styleApiUrl = `https://${wikiLang}.${isMobile ? "m." : ""}wikipedia.org/w/load.php?lang=${wikiLang}&only=styles&skin=${skin}&modules=`
            const styleUrl = `${styleApiUrl}${encodeURIComponent(modules.join("|"))}`;
            const urls = [
                styleUrl
            ];
            const sheets = await Promise.all(
                urls.map(async (url) => {
                    const response = await fetch(url);
                    let cssText = await response.text();
                    cssText = cssText.replace(/html.skin/g, 'div[data-is-html].skin');
                    const sheet = new CSSStyleSheet();
                    console.log({cssText});
                    await sheet.replace(cssText);
                    
                    return sheet;
                })
            );
            const wikiPageCssStyleSheet = await convertToCSSStyleSheet(wikiPageCssString);
            setStyleSheets([wikiPageCssStyleSheet, ...sheets]);
        };

        loadStyleSheets();
    });

    return (
        <root.div mode="open" styleSheets={styleSheets} ref={scrollRef}>
            <div data-is-html role="article" className={[...htmlClasses, "wiki-page"].join(" ")} ref={wikiRef}>
                <div data-is-body className={(disable ? "disable" : "") + " content"} >
                    <h1 className="wiki-title"  style={{textAlign: "center"}}>{title}</h1>
                    <h2 className="wiki-title">{wikiPage.title}</h2>
                    <div className="mw-parser-output" 
                        dangerouslySetInnerHTML={{ __html: wikiPage.doc?.body.firstElementChild?.innerHTML ?? "" }}
                    >
                    </div>    
                </div>
            </div>
        </root.div>
    );
};
