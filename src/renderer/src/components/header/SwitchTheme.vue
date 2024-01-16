<template>
  <div>
    <InputSwitch v-model="bool" />
    pi-moon
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
