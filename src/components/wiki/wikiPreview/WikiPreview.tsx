import type { WikiContentPreview } from "@/composables/useWiki";
import { WikiThumbnail } from "../wikiThumbnail/wikiThumbnail";
import type { ComponentProps, DOMAttributes } from "react";
import "./wikiPreview.css";

type WikiPreviewProps =  DOMAttributes<HTMLDivElement> & ComponentProps<"div"> & {
    wikiContentPreview: WikiContentPreview | null
}

export function WikiPreview({ wikiContentPreview, ...props }:WikiPreviewProps) {
    return [
    <div className="wiki-preview" {...props} key={wikiContentPreview?.id ?? "unknown"}>
        <WikiThumbnail thumbnail={wikiContentPreview?.thumbnail ?? null} />
        <h3>{(wikiContentPreview?.title || "???")}<slot /></h3>
        <p>{wikiContentPreview?.description || "???"}</p>
    </div>
    ]
}