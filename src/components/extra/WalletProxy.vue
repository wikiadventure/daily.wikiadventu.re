<template>
    <q-popup-proxy breakpoint="9999999999999999">
        <q-card>
            <q-toolbar>
                <q-btn round flat type="a" size="1em" href="https://nano.org">
                    <img src="~assets/icons/nano.svg" style="height: 1em;" alt="nano currency logo" />
                </q-btn>
                <q-toolbar-title>{{ title ?? t('myNanoAddress') }}</q-toolbar-title>
                <q-btn flat round dense icon="close" v-close-popup />
            </q-toolbar>
            <q-separator/>
            <q-card-section class="row justify-center">
                <img class="QRCode" :src="walletQrCode"/>
            </q-card-section>
            <q-separator/>
            <q-card-actions align="center">
                <div class="row items-end q-mx-sm"><p class="nanoAddress">{{ props.address }}</p><q-btn round flat icon="mdi-content-copy" @click="copyAddress" /></div>
            </q-card-actions>
        </q-card>
    </q-popup-proxy>
</template>
<style>
</style>
<script lang="ts" setup>
import { useQRCode } from "@vueuse/integrations/useQRCode";
import { CopyToClipboard } from "src/composables/utils/CopyToClipboard";
import { useI18n } from 'vue-i18n';

const { t } = useI18n({ useScope: 'local' });

const props = defineProps({
    title: {
        type: String,
        default: null
    },
    address: {
        type: String,
        default: "nano_3jni6cbrerctggsf1regmsh3uhwz3t4e7336agqfbu1derurtoojqhkt5kp3"
    }

});

const walletQrCode = useQRCode(props.address);

function copyAddress() {
    CopyToClipboard(props.address, t('copySuccess'), t('copyFail'));
}

</script>
<i18n lang="yaml">
    en:
        myNanoAddress: "My Nano address"
        copySuccess: "Address copied successfully!"
        copyFail: "Failed to copy the address"
    fr:
        myNanoAddress: "Mon adresse Nano"
        copySuccess: "Adresse copié avec succès!"
        copyFail: "Échec de la copie de l'adresse"
    en:
        myNanoAddress: "Meine Nano-Adresse"
        copySuccess: "Adresse erfolgreich kopiert!"
        copyFail: "Die Adresse könnte nicht kopiert werden"
</i18n>
