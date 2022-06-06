<template>
    <q-btn push class="github-btn" size="2em" type="a" :href="props.link" target="_blank">
        <mdi-github/> Github
    </q-btn>
</template>
<style lang="scss">
.github-btn {
    margin: 0 15px 5px;
    border-radius: 5px;
    background: var(--clr-main);
    color: var(--clr-reverse);
}
</style>
<script lang="ts" setup>
import MdiGithub from '~icons/mdi/github';

const props = defineProps({
    link: {
        type: String,
        default: "https://github.com/Sacramentix/WikiAdventureDaily"
    }
})
</script>
