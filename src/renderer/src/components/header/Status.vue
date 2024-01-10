<template>
  <div class="flex justify-content-end align-items-center gap-2 pe-none">
    <span>{{ props.started ? 'Connected' : 'Disconnected' }}</span>
    <InputSwitch v-model="bool" />
  </div>
</template>

<script setup>
import { defineProps, watch, ref } from 'vue'
import InputSwitch from 'primevue/inputswitch'
const props = defineProps({
  started: Boolean
})
const bool = ref()
watch(() => {
  props.started
  bool.value = props.started
})
</script>

<style lang="scss" scoped></style>
