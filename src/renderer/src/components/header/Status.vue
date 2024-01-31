<template>
  <div class="flex gap-2 align-items-center pe-none">
    <span>{{ props.started ? 'Connected' : 'Disconnected' }}</span>
    <InputSwitch v-model="bool" />
  </div>
</template>

<script setup>
import { watch, ref } from 'vue'
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
