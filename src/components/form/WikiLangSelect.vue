<template>
  <q-select
    class="wiki-lang-select"
    v-model="wikiLang" name="wikiLang" outlined hint=""
    :options="langOptions(dailyAvailableIn)" :label="t('wikiLang')"
    :display-value="getLabel(wikiLang)" emit-value map-options
    :dense="$q.screen.lt.sm" v-bind="$attrs"
  >
  </q-select>
</template>
<style lang="scss">
.wiki-lang-select {
  min-width: 26ch;
}
</style>
<script lang="ts" setup>
import { langOptions, getLabel, Lang } from 'src/boot/i18n';
import { useI18n } from 'vue-i18n';
import { wikiLang } from "./wikiLang";

const dailyAvailableIn = [
    Lang.en,
    Lang.fr,
    Lang.de,
    Lang.es
]

const { t } = useI18n({ useScope: 'local' });
</script>
<i18n lang="yaml">
  en:
    wikiLang: "Wiki language"
  fr:
    wikiLang: "Langue du Wiki"
  de:
    wikiLang: "Sprache des Wiki"
  es:
    wikiLang: "Idioma Wiki"
</i18n>
