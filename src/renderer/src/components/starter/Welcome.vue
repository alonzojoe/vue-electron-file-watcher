<template>
  <div class="welcome-container flex align-items-center justify-content-center">
    <div class="w-7 grid grid-items">
      <div class="col-12 flex justify-content-center">
        <Header />
      </div>
      <div class="col-12 text-center">
        <span class="mt-5"
          ><i class="pi pi-spin pi-spinner text-xs mr-2" style="font-size: 1rem"></i
          >{{ startupMessage }}</span
        >
      </div>
      <div class="col-12">
        <ProgressBar class="" :value="value1" />
      </div>
    </div>
  </div>
</template>

<script setup>
import Header from '../header/Header.vue'
import ProgressBar from 'primevue/progressbar'
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

const emit = defineEmits(['show-main'])
const flagBool = ref(false)
const showMenu = (data) => {
  if (data >= 100 && !flagBool.value) {
    setTimeout(() => {
      emit('show-main', true)
      flagBool.value = true
    }, 2000)
  }
}

const startupMessage = ref('Loading Resources...')
const setStartup = (progress) => {
  if (progress < 15) {
    startupMessage.value = 'Loading Resources...'
  } else if (progress < 30) {
    startupMessage.value = 'Checking Directories...'
  } else if (progress < 60) {
    startupMessage.value = 'Checking API`s...'
  } else if (progress < 90) {
    startupMessage.value = 'Checking Additional Resources...'
  } else if (progress < 100) {
    startupMessage.value = 'Launching File Watcher...'
  }
}

onMounted(() => {
  startProgress()
})

onBeforeUnmount(() => {
  endProgress()
})

const value1 = ref(0)
const interval = ref()
const startProgress = () => {
  interval.value = setInterval(() => {
    let newValue = value1.value + Math.floor(Math.random() * 10) + 1
    if (newValue >= 100) {
      newValue = 100
    }
    setStartup(newValue)
    value1.value = newValue
    showMenu(newValue)
  }, 300)
}
const endProgress = () => {
  clearInterval(interval.value)
  interval.value = null
}
</script>

<style scoped>
.welcome-container {
  height: 95vh;
  width: 100%;
}
</style>
