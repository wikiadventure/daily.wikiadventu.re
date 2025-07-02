import { readdir, writeFile } from "node:fs/promises";

const dailyLangs = await readdir("./public/daily");

const filePromises = dailyLangs.map(async lang => {
 const folder = "./public/daily/"+lang;
    const allPaths = await readdir(folder, {recursive:true});
    await writeFile(
        folder+"/available",
        allPaths.filter(p=>/\d{4}\/\d{2}\/\d{2}/.test(p))
                .join("\n")
    );
})

await Promise.all(filePromises);