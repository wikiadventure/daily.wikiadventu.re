<template>
  <q-select class="compact-lang-switch"
    v-model="locale" :options="langOptions(translatedLang)"
    dense standout emit-value
    v-bind="$attrs" behavior="dialog">
    <template v-slot:prepend>
        <mdi-translate/>
    </template>
  </q-select>
</template>
<style lang="scss">
.compact-lang-switch {
  .q-field__append {
    display: none;
  }
  .q-field__control {
    background: transparent!important;
    div {
      color: var(--clr-reverse)!important;
    }
  }
}
</style>
<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { langOptions, translatedLang } from '../../boot/i18n';
import MdiTranslate from '~icons/mdi/translate';

const { locale } = useI18n({ useScope: 'global' });
</script>
