<template>
    <div class="daily-result">
        <compact-lang-switch  class="absolute-top-left q-ma-sm"/>
        <!-- <theme-switch class="absolute-top-right q-ma-sm" /> -->
        <LogoShowIn />
        <h2>Daily</h2>
        <h3>{{ startPage }} → {{ endPage }}</h3>
        <p>{{ path.length-1 }} {{ t('linkInTime', path.length-1) }} {{ formatTime }}</p>
        <div class="action">
            <q-btn v-if="isSupported" push @click="shareResult">
                {{ t('share') }} <mdi-share-variant/>
            </q-btn>
            <q-btn push @click="copyLink">
                {{ t('copyShare') }} <mdi-share-variant/>
            </q-btn>
            <q-btn push class="action-btn" to="/">
                {{ t('play') }} <mdi-play/>
            </q-btn>
        </div>
        <section>
            <div v-if="loading" loader></div>
            <a v-else v-for="p in pageList" :href="wikiUrl(p.title || '')">
                <wiki-preview :wikiPreview="p"/>
            </a>
        </section>
    </div>
</template>
<style lang="scss">
.daily-result {
    overflow-x: hidden;
    width: 100%;
    min-height: 100%;
    display: flex;
    text-align: center;
    flex-direction: column;
    align-items: center;
    padding: 15px;
    gap: 15px;
    .logo-show-in {
        --logo-height: min(8em, 25vw);
    }

    .action {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        padding: 20px;
        gap: 20px;
    }

    section {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 5px;
        gap: 15px;
        >a {
            text-decoration: none;
            color: unset;
            width: max(500px, 50%);
            max-width: 100%;
        }
        > a:first-child:nth-last-child(50) ~ a:nth-child(26):before {
            content: "...";
            font-size: 3em;
            line-height: 100px;
        }
    }
    >h2 {
        margin: 30px 0;
    }
    >h3, >p {
        margin: 15px;
    }
    // >h2, >h3, >p {
    //     margin: 15px;
    // }
    >p {
        font-size: 2em;
    }

    .wiki-preview {
        background: #cdfdfa;
        border-radius: 15px;
    }

    div[loader] {
        border: 5px solid #fff;
        filter: drop-shadow(0 0 5px cyan);
        text-align: center;
        line-height: 10ch;
        // vertical-align: middle;
        width: 10ch;
        height: 10ch;
        animation: loader 1s infinite linear;
    }

    @keyframes loader {
        0% {   transform: rotate(0deg); border-radius: 50%; }
        50% {  transform: rotate(90deg); border-radius: 5%; }
        100% { transform: rotate(180deg); border-radius: 50%; }
    }
}
</style>
<script lang="ts" setup>
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { useShare } from "@vueuse/core";
import LogoShowIn from "../components/art/LogoShowIn.vue";
import WikiPreview from "src/components/WikiPreview.vue";
import type { WikiPreview as WikiPagePreview } from "src/composables/useWiki";
// import ThemeSwitch from "src/components/setting/ThemeSwitch.vue";
import { useI18n } from "vue-i18n";
import CompactLangSwitch from "src/components/setting/CompactLangSwitch.vue";
import { Lang } from "src/boot/i18n";
import { loadPreviews } from "src/composables/useWiki";
import { CopyToClipboard } from '../composables/utils/CopyToClipboard';
import mdiShareVariant from "~icons/mdi/share-variant";
import mdiPlay from "~icons/mdi/play";

const { t } = useI18n({ useScope: 'local' });

const route = useRoute();

const { share, isSupported } = useShare();

const lang = ref(route.params.lang as Lang ?? Lang.en);
const time = ref(parseInt(route.query.time as string ?? "0"));
const path = (route.query.path as string || "").split("|").map(s=>decodeURIComponent(s));
const path50 = path.length > 50 ? path.slice(0,25).concat(path.slice(path.length-25)) : path;
console.log(path50.length);
const pageList = ref<WikiPagePreview[]>([]);
const loading = ref(true);

const formatTime = computed(()=>{
  const min = Math.floor(time.value/60)
  const minS = min > 0 ? min+"m" : "";
  const secS = time.value % 60+"s";
  return minS+secS;
})

loadPreviews(path50, lang.value).then(x=>{
    const { previews, response} = x;
    const normalizedMap = new Map<string, string>();
    const redirectsMap  = new Map<string, string>();
    console.log(response);
    response.query.normalized?.forEach(o=>normalizedMap.set(o.from,o.to));
    response.query.redirects ?.forEach(o=>redirectsMap .set(o.from,o.to));
    console.log(path);
    pageList.value = path.map(title => {
        var s = normalizedMap.get(title) ?? title;
        s =  redirectsMap.get(s) ?? s;
        return previews.find(p => p.title == s)
                            ??
        ( { title: decodeURIComponent(title),
            description: t('pageNotFound') } );
    });

    loading.value = false;
});

const shareURL = window.location.origin+route.fullPath

const startPage = computed(()=> pageList.value[0]?.title ?? path[0].replace(/_/g," "));
const endPage = computed(()=> pageList.value[pageList.value.length-1]?.title || path[path.length-1].replace(/_/g," "));

const wikiUrl = (t:string) => `https://${lang.value}.wikipedia.org/wiki/${encodeURIComponent(t)}`;

function shareResult() {
    share({
        title: t('shareTitle'),
        text: `${startPage.value} → ${endPage.value}\n ${path.length-1} ${t('linkInTime', path.length-1)} ${time.value} s`,
        url: shareURL,
    })
}

function copyLink() {
    CopyToClipboard(shareURL, t('copySuccess'), t('copyFail'));
}

</script>

<i18n lang="yaml">
    en:
        share: "Share"
        copyShare: "Copy share link"
        play: "Play"
        links: "link | links"
        linkInTime: '@:links in'
        pageNotFound: "Page not found on wikipedia"
        copySuccess: "Link copied successfully!"
        copyFail: "Failed to copy the link"
        shareTitle: "My epic on Wiki Adventure Daily"
    fr:
        share: "Partager"
        copyShare: "Copier le lien de partage"
        play: "Jouer"
        links: "lien | liens"
        linkInTime: '@:links en'
        pageNotFound: "Page introuvable sur Wikipédia"
        copySuccess: "Lien copié avec succès!"
        copyFail: "Échec de la copie du lien"
        shareTitle: "Mon épopée sur Wiki Adventure Daily"
    de:
        share: "Teile"
        copyShare: "Teilen-Link kopieren"
        play: "Spielen"
        links: "link | links"
        linkInTime: '@:links in'
        pageNotFound: "Seite nicht auf Wikipedia gefunden"
        copySuccess: "Link erfolgreich kopiert!"
        copyFail: "Der Link konnte nicht kopiert werden"
        shareTitle: "Mein Epos auf Wiki Adventure Daily"
    es:
        share: "Comparte"
        copyShare: "Copiar enlace para compartir"
        play: "Jugar"
        links: "link | links"
        linkInTime: '@:links in'
        pageNotFound: "Página no encontrada en wikipedia"
        copySuccess: "¡Enlace copiado exitosamente!"
        copyFail: "No se pudo copiar el enlace"
        shareTitle: "Mi epopeya en Wiki Adventure Daily"
</i18n>

