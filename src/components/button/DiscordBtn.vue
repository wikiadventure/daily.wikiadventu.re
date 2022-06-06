<template>
    <q-btn push class="discord-btn" size="2em" type="a" :href="props.link" target="_blank">
        <mdi-discord/> Discord
    </q-btn>
</template>
<style lang="scss">
.discord-btn {
    margin: 0 15px 5px;
    border-radius: 5px;
    background: #7289DA;
    color: #eee;
}
</style>
<script lang="ts" setup>
import MdiDiscord from '~icons/mdi/discord';

const props = defineProps({
    link: {
        type: String,
        default: "https://discord.gg/wRN6Dam"
    }
})
</script>
