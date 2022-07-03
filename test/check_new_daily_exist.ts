import { assert } from "https://deno.land/std@0.146.0/testing/asserts.ts";
import { stringify } from "https://deno.land/std@0.140.0/node/querystring.ts";

const gitDiff = Deno.run({
    cmd: ["git diff --name-only HEAD^ HEAD"],
    stdout: 'piped',
    stderr: 'piped',
    stdin: 'null'
});
await gitDiff.status();
const files = new TextDecoder().decode(await gitDiff.output()).split(/\r*\n/);

for (const file of files) {
    if (file.startsWith("public/daily/")) {
        const [,,lang,year,month,day] = file.split("/");
        Deno.test(`Check title of daily ${file}`, async () => {
            const content = await Deno.readTextFile(file);
            const [start, end, ...{ length: rest }] = content.split(/\r*\n/);
            assert(start != null, file + "first line is empty. First line should be the daily start page.");
            assert(end != null, file + "second line is empty. Second line should be the daily target page.");
            assert(rest < 2, file + " have too much lines.");
            assert(!start.includes(" "), "Start title contain space. Make sure you copy the title from the search bar!");
            assert(!end.includes(" "), "Target title contain space. Make sure you copy the title from the search bar!");
            const query = stringify({
                action: "query",
                format: "json",
                titles: [start.replaceAll("_"," "), end.replaceAll("_"," ")].join("|")
            });
            const data = await fetch(`https://${lang}.wikipedia.org/w/api.php?${query}`).then(r=>r.json());
            const { "-1": page1, "-2": page2 } = data?.query?.pages;
            assert(page1 == null, `
Can't find those page on wikipedia :

${[page1,page2].map(p=>p!=null?`'${p.title}'`:``).join("\n")}

Make sure you copy the title from the search bar!
            `)
        })
    }
}
