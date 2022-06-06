<template>
    <q-btn push class="kofi-btn" size="2em" type="a" :href="props.link" target="_blank">
        <simple-icons-kofi/> Ko-fi
    </q-btn>
</template>
<style lang="scss">
.kofi-btn {
    margin: 0 15px 5px;
    border-radius: 5px;
    background: #29abe0;
    color: #fff;
}
</style>
<script lang="ts" setup>
import SimpleIconsKofi from '~icons/simple-icons/kofi';

const props = defineProps({
    link: {
        type: String,
        default: "https://ko-fi.com/sacramentix"
    }
})
</script>
