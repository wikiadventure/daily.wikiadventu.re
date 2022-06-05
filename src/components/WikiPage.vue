<template>
  <shadow_root class="wiki-page">
    <html>
      <shadow_style lang="css">
        {{ WikiPageCss }}
      </shadow_style>

      <head v-html="wikiPage.head?.innerHTML"> </head>
      <body ref="wiki" :class="{ disable: props.disable }">
        <h1 class="wiki-title">{{ props.title }}</h1>
        <div class="mw-parser-output" v-html="wikiPage.doc?.body.firstElementChild!.innerHTML">

        </div>
      </body>
    </html>
  </shadow_root>
</template>
<style lang="scss">
</style>
<script lang="ts" setup>
import WikiPage from "./WikiPage";
import { nextTick, reactive, ref } from "vue";
import { shadow_root, shadow_style } from "vue-shadow-dom";
import { Lang } from "src/boot/i18n";
import WikiPageCss from "./WikiPage.scss";

const props = defineProps({
  disable: Boolean,
  title: String
});

const emit = defineEmits<{
  (e: "wikiLink", value: string): void;
}>();

const wiki = ref<HTMLElement>();
wiki.value?.blur()

const wikiPage = reactive(new WikiPage());
const loading = ref(false);
const safeModeInterrupted = ref(false);
const linkDisable = ref(false);
const title = ref("");
const content = ref("");

// props.disable || useMeta(() => {
//   return {
//     title: wikiPage.title || "Wiki Adventure"
//   }
// })

async function requestWikiPage(url: string) {
  return await new Promise<void>(async (resolve, reject) => {
    if (loading.value) return;
    loading.value = true;
    safeModeInterrupted.value = true;
    await fetchArticle(url)
      .then(a => {
        setTimeout(()=>{
          nextTick().then(() => {
            redirectLinks(wiki.value);
            loading.value = false;
            resolve();
          });
        }, 25);
      }).catch(e => {
        loading.value = false;
        console.log(e);
        reject();
      });
  })
}

function redirectLinks(doc?: HTMLElement) {
  if (!doc) return;
  var links = doc.querySelectorAll("a, area");
  for (var i = 0; i < links.length; i++) {
    links[i].addEventListener("click", function (e) {
      e.preventDefault();
      //@ts-ignore
      onLinkClick(this);
    });
    var href = links[i].getAttribute("href");
    var classes = links[i].classList;
    if (href == undefined) continue;
    if (href!.startsWith("#")) {
      classes.add("anchorLink");
    } else if (href!.startsWith("/wiki/")) {
      if (href!.indexOf(":") != -1) {
        var sub = href.substring(6);
        var d = decodeURI(sub).replace(/\_/g, ' ');
        if (wikiPage.links.find(l => l.title == d && l.ns == 0)) {
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
  }
}

function onLinkClick(link: HTMLAnchorElement) {
  var linkHref = link.getAttribute("href");
  if (linkHref == undefined) return;
  //check if the link go to another wikipage and not info page or external
  if (!props.disable && link.classList.contains("wikiLink")) {
    var url = linkHref.substring(6);
    var anchor = url.indexOf("#");
    if (anchor != -1) url = url.substring(0, anchor);
    url = decodeURIComponent(url);
    emit("wikiLink", url);
    requestWikiPage(url).then(() => {
      if (anchor != -1) scrollToAnchor(url.substring(anchor + 1));
      else wiki.value?.scrollTo(0, 0);
    });
  } else if (linkHref.startsWith("#")) {
    scrollToAnchor(decodeURI(linkHref.substring(1)));
  }
}

async function fetchArticle(title: string) {
  safeModeInterrupted.value = false;
  return await wikiPage.fetch(title, Lang.fr, true);
}

function scrollToAnchor(id: string) {
  scrollToID(id, wiki.value);
}

function scrollToID(id:string, scrollContainer?:HTMLElement | Document) {
    if (!scrollContainer) scrollContainer = document;
    var element = scrollContainer.querySelector(`[id='${id}']`);
    if (!element) return;
    element.scrollIntoView();
}

defineExpose({
  requestWikiPage,
  title,
  content
})

</script>
