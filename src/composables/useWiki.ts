import type { LangCode } from "@/i18n/lang";
import { createSeededRandomGenerator, generateCloseNumbers } from "./numberUtils";

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
            title: page?.title,
            description: page?.terms?.description[0],
            thumbnail: page?.thumbnail,
            id: page.pageid
        });
    }
    return { previews, response };
}

export async function getSeededRandomPages(
    lang: string,
    date: Date,
    seed: string,
    numberOfPages: number
) {
    const highestPageId = await getHighestPageId(lang, date);

    const random = createSeededRandomGenerator(seed);

    const randomPageIds = Array.from({ length: numberOfPages }, (_,i) =>
        random(highestPageId)
    );
    const pages: { pageid:number, title:string }[] = [];

    findRandomPage: for (const pageId of randomPageIds) {
        const url = new URL(`https://${lang}.wikipedia.org/w/api.php`);
        const page_ids_sequence = generateCloseNumbers(pageId, 0, highestPageId, 50);
        const params: Record<string, string> = {
            action: "query",
            format: "json",
            pageids: page_ids_sequence.join("|"),
            prop: "info",
            formatversion: "2",
            origin: "*"
        };

        Object.keys(params).forEach((key) => {
            url.searchParams.append(key, params[key]);
        });

        type ApiReturn = {
            batchcomplete: true,
            query: {
                pages: WikiPageInfo[],
            }
        }
        const response = await fetch(url.toString(), { headers: wikiHeaders });
        const json: ApiReturn = await response.json();
        let page_id_to_page_info = json.query.pages.reduce((acc,p)=>{
            acc[p.pageid] = p;
            return acc;
        },{} as Record<number, WikiPageInfo>);
        
        for (const page_id of page_ids_sequence) {
            const page = page_id_to_page_info[page_id];
            if (!("missing" in page) && page.ns == 0 && page.redirect == null) {
                pages.push({ pageid: page.pageid, title: page.title });
                continue findRandomPage;
            }
        }
        throw "Unable to find seeded Random in 50 page batch";
    }

    return pages;
}

export async function getHighestPageId(lang: string, date:Date): Promise<number> {
  const url = new URL(`https://${lang}.wikipedia.org/w/api.php`);
  const params: Record<string, string> = {
    action: "query",
    format: "json",
    list: "recentchanges",
    formatversion: "2",
    rcend: date.toISOString(),
    rcdir: "newer",
    rcnamespace: "0",
    rcprop: "ids",
    rclimit: "1",
    rctype: "new",
    origin: "*"
  };

  Object.keys(params).forEach((key) => {
    url.searchParams.append(key, params[key]);
  });

  const response = await fetch(url.toString(), { headers: wikiHeaders });
  const json = await response.json();
  const pageId = json.query.recentchanges[0].pageid;

  return pageId;
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


type WikiPageInfo = {
    pageid: number,
    ns: number,
    title: string,
    contentmodel: string,
    pagelanguage: string,
    pagelanguagehtmlcode: string,
    pagelanguagedir: string,
    touched: string,
    lastrevid: number,
    length: number,
    redirect?:true
} | {
    pageid: number,
    missing: true
}