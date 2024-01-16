<template>
  <div>
    <Button
      :icon="currentTheme == 'dark' ? 'pi pi-sun' : 'pi pi-moon'"
      rounded
      aria-label="Filter"
      :pt="{
        root: { class: 'h-2rem w-2rem' }
      }"
      @click="toggleChangeTheme"
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

const darkCss = new URL('/src/assets/css/lara-dark-green.css', import.meta.url)
const body = document.body
const addDarkTheme = () => {
  const existingLinkTag = document.getElementById('dark-mode')

  if (!existingLinkTag) {
    const linkTag = document.createElement('link')
    linkTag.id = 'dark-mode'
    linkTag.rel = 'stylesheet'
    linkTag.href = `${darkCss}`

    document.head.appendChild(linkTag)
  }
}

const removeDarkTheme = () => {
  const linkTag = document.getElementById('dark-mode')
  if (linkTag) {
    document.head.removeChild(linkTag)
  }
}

const toggleChangeTheme = async () => {
  currentTheme.value = currentTheme.value == 'dark' ? 'light' : 'dark'
  localStorage.setItem('app-theme', currentTheme.value)
  body.classList.add('fade-effect', 'fade-out')
  if (currentTheme.value == 'dark') {
    addDarkTheme()
  } else {
    removeDarkTheme()
  }
}

const mountedTheme = (theme) => {
  if (theme == 'dark') {
    addDarkTheme()
  } else {
    removeDarkTheme()
  }
}

onMounted(() => {
  currentTheme.value = deviceTheme
  mountedTheme(currentTheme.value)
})
</script>

<style lang="scss" scoped></style>
