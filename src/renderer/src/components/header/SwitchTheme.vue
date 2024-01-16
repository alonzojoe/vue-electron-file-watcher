<template>
  <div>
    <Button
      :icon="currentTheme == 'dark' ? 'pi pi-sun' : 'pi pi-moon'"
      rounded
      aria-label="Filter"
      :pt="{
        root: { class: 'h-2rem w-2rem' }
      }"
      @click="changeTheme"
    />
    <!-- {{ currentTheme }} -->
  </div>
</template>

<script setup>
import { watch, ref, onMounted } from 'vue'
import Button from 'primevue/button'
const props = defineProps({
  started: Boolean
})
const bool = ref()
watch(() => {
  props.started
  bool.value = props.started
})

const deviceTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

console.log('window current:', deviceTheme)

const changeTheme = () => {
  currentTheme.value = currentTheme.value == 'dark' ? 'light' : 'dark'
}

const currentTheme = ref('')
onMounted(() => {
  currentTheme.value = deviceTheme
})
</script>

<style lang="scss" scoped></style>
