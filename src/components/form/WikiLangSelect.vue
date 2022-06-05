<template>
  <q-select
    class="wiki-lang-select"
    v-model="wikiLang" name="wikiLang" outlined hint=""
    :options="langOptions()" :label="t('wikiLang')"
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
import { langOptions, getLabel } from 'src/boot/i18n';
import { useI18n } from 'vue-i18n';
import { wikiLang } from "./wikiLang";

const { t } = useI18n({ useScope: 'local' });
</script>
<i18n lang="yaml">
  en:
    wikiLang: "Wiki language"
  fr:
    wikiLang: "Langue du wiki"
</i18n>
