import { langsKey, type LangCode } from "./lang";

function getLang(AstroRequest?: { url: string }) {
    if (typeof document !== "undefined") {
        const currentUrl = document.location.pathname;
        const parsedLocal = currentUrl.split("/").at(1);
        return (langsKey.includes(parsedLocal as LangCode) ? parsedLocal : "en") as LangCode;
    } else if (AstroRequest) {
        const currentUrl = new URL(AstroRequest.url).pathname;
        const parsedLocal = currentUrl.split("/").at(1);
        return (langsKey.includes(parsedLocal as LangCode) ? parsedLocal : "en") as LangCode;
    }
    return "en";
}

export const lang = getLang();