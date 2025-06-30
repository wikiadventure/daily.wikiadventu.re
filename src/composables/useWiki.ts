import type { LangCode } from "@/i18n/lang";

export async function loadPreviews(titles: string[], lang: LangCode) {
    var url = new URL('https://' + lang + '.wikipedia.org/w/api.php');
    url.search = new URLSearchParams({
        action: 'query',
        format: 'json',
        titles: titles.join("|"),
        prop: 'pageprops|pageimages|pageterms',
        redirects: '1', // Automatically resolve redirects
        piprop: 'thumbnail',
        pithumbsize: '160',
        pilimit: '30',
        wbptterms: 'description',
        origin: '*',
    }).toString();
    const response: PreviewsResponse = await fetch(url.toString(), { headers: wikiHeaders })
        .then((r) => r.json())
        .catch((error) => {
            console.log(error);
        })
    var previews: WikiContentPreview[] = [];
    if (typeof response?.query?.pages === 'undefined') return { previews, response };
    for (const page of Object.values(response.query.pages) as WikiRawSuggestion[]) {
        if (page.missing != null) continue;
        previews.push({
            title: page.title,
            description: page?.terms?.description[0],
            thumbnail: page?.thumbnail,
            id: page.pageid
        });
    }
    return { previews, response };
}

export type WikiRawSuggestion = {
    pageid: number,
    ns: number,
    index: number,
    title: string,
    terms: {
        description: string[]
    },
    thumbnail: {
        source: string,
        width: number,
        height: number
    }
    missing?: string
}

export interface WikiContentPreview {
    title?: string,
    description?: string
    thumbnail?: {
        source: string,
        width: number,
        height: number
    },
    id: number
}

export const wikiHeaders = new Headers({
    "Api-User-Agent": "wiki-adventure/1.1 (https://wikiadeventu.re/; pro@sacramentix.fr)"
});

type PreviewsResponse = {
    query: {
        redirects: {
            from: string,
            to: string
        }[],
        normalized: {
            from: string,
            to: string
        }[],
        pages: any
    }
}
