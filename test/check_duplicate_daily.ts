import { assert } from "https://deno.land/std@0.146.0/testing/asserts.ts";
import {
    walk
} from "https://deno.land/std@0.144.0/fs/mod.ts";

enum Lang {
    en = "en",
    fr = "fr"
}

const maintainedLang = [
    Lang.en,
    Lang.fr
];

type DailyEntry = {
    path: string,
    start: string,
    end: string,
}

for (const lang of maintainedLang) {

    Deno.test(`Duplicate check for lang ${lang}`, async () => {
        const dailies:DailyEntry[] = []
        for await (const {isDirectory , path} of walk(`public/daily/${lang}`)) {
            if(isDirectory) continue;
            const content = await Deno.readTextFile(path);
            const [start, end, ...{ length: rest }] = content.split(/\r*\n/);
            if (rest > 1) console.info(path + " have too much lines.");
            dailies.push({
                path,
                start,
                end
            });
        }
        function checkForDuplicates(array:DailyEntry[]):[string, Set<DailyEntry>][] {
            const exist:Record<string,Set<DailyEntry>> = {};
            array.forEach(d => [d.start,d.end].forEach(e=>exist[e]?.add(d) || (exist[e] = new Set([d]))));
            return Object.keys(exist).filter(k=>exist[k]?.size>1).map(k=>[k,exist[k]]);
        }

        function printDuplicates(duplicates:[string, Set<DailyEntry>][]):string {
            return `
There is duplicates in '${lang}' daily:

${duplicates.map(([title, set])=>
`The title '${title}' is found in multiple daily:

${Array.from(set).map(({path,start,end})=>`${path} : '${start}' → '${end}'`).join("\n")}
            `).join("\n")}`
        }

        const allDuplicates = checkForDuplicates(dailies);
        if (allDuplicates.length != 0) {
            console.info("Some duplicates between all daily : ");
            console.info(printDuplicates(allDuplicates));
        }
        const last90Duplicates = dailies.length > 90 ? checkForDuplicates(dailies.slice(-90)) : allDuplicates;
        assert(last90Duplicates.length == 0,`
To push successfully make sure you resolve this duplicate :

${printDuplicates(last90Duplicates)}
        `);
    });

}
