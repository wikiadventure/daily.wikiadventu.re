<template>
  <q-toggle class="safeModeToggle q-ma-none"
            v-model="safeMode"
            checked-icon="check"
            unchecked-icon="clear"
            size="lg"
            color="black">
    <q-tooltip anchor="top middle" self="bottom middle" :offset="[10, 10]">
      {{ t("safeModeTooltip") }}
    </q-tooltip>
  </q-toggle>
</template>
<style lang="scss">
.safeModeToggle {
  .q-toggle__thumb:after {
    background: var(--clr-reverse);
  }
  .q-icon {
    opacity: 1;
    color: var(--clr-main)!important;
  }
}
</style>
<script lang="ts" setup>
import { safeMode } from 'store/setting/state';
import { useI18n } from 'vue-i18n';

const { t } = useI18n({ useScope: 'local' });
</script>
<i18n lang="yaml">
  en:
    safeModeTooltip: "SafeMode will blur image of wikipedia, you can unblur image for the current page with Ctrl + Alt + Q"
  fr:
    safeModeTooltip: "SafeMode vas flouter les images de wikipédia, vous pouvez les défloutés pour la page en cours avec Ctrl + Alt + Q"
  de:
    safeModeTooltip: "Im SafeMode wird das Bild von Wikipedia unscharf. Sie können das Bild für die aktuelle Seite mit Strg + Alt + Q unscharf machen"
  es:
    safeModeTooltip: "SafeMode desenfocará la imagen de Wikipedia, puedes desenfocar la imagen de la página actual con Ctrl + Alt + Q"
</i18n>
