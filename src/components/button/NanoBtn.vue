<template>
    <q-btn push class="nano-btn" size="2em" type="btn">
        <simple-icons-nano/> Nano
        <wallet-proxy/>
    </q-btn>
</template>
<style lang="scss">
.nano-btn {
    margin: 0 15px 5px;
    border-radius: 5px;
    background: #fff;
    color: #4a90e2;
}
</style>
<script lang="ts" setup>
import SimpleIconsNano from '~icons/simple-icons/nano';
import WalletProxy from 'src/components/extra/WalletProxy.vue';

</script>
