import { i18n } from "src/boot/i18n";
import { ref } from "vue";

export const wikiLang = ref(i18n.global.locale.value);