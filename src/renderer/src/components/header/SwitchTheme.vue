<template>
  <div>
    <Button
      :icon="currentTheme == 'dark' ? 'pi pi-sun' : 'pi pi-moon'"
      v-tooltip.right="{
        value: `Change theme`,
        pt: {
          text: 'p-2 font-sm'
        }
      }"
      rounded
      aria-label="Filter"
      :pt="{
        root: { class: 'h-2rem w-2rem z-5 relative' }
      }"
      @click="toggleChangeTheme"
    />
  </div>
</template>

<script setup>
import { watch, ref, onMounted } from 'vue'
import Button from 'primevue/button'
const props = defineProps({
  started: Boolean
})

const emit = defineEmits(['current-theme'])

const bool = ref()
watch(
  () => props.started,
  (newValue) => {
    bool.value = newValue
  }
)

const deviceTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

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
    emit('current-theme', 'dark')
  } else {
    removeDarkTheme()
    emit('current-theme', 'light')
  }
}

const mountedTheme = (theme) => {
  if (theme == 'dark') {
    addDarkTheme()
    emit('current-theme', 'dark')
  } else {
    removeDarkTheme()
    emit('current-theme', 'light')
  }
}

onMounted(() => {
  currentTheme.value = deviceTheme
  mountedTheme(currentTheme.value)
})
</script>

<style lang="scss" scoped></style>
