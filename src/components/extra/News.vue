<template>
    <h3>{{ t('news') }}</h3>
    <p>
        {{ t('content') }}
    </p>
</template>
<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n({ useScope: 'local' });
</script>
<i18n lang="yaml">
  en:
    news: "News"
    content: |
        Fix win conditions to be check after redirection
        Dark mode coming soon!
  fr:
    news: "News"
    content: |
    Correction de la vérification de la conditions de victoire après redirection
    Le thème sombre arrive bientôt!
</i18n>

