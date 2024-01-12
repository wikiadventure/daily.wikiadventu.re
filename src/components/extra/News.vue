<template>
    <section>
        <h3>{{ t('news') }}</h3>
        <p>
            {{ t('content') }}
        </p>
    </section>
</template>
<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n({ useScope: 'local' });
</script>
<i18n lang="yaml">
  en:
    news: "News"
    content: "Dark mode coming soon!"
  fr:
    news: "News"
    content: "Le thème sombre arrive bientôt!"
  de:
    news: "News"
    content: "Der Dunkelmodus kommt bald!"
  es:
    news: "News"
    content: "¡El modo oscuro llegará pronto!"
</i18n>

