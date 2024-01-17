<template>
  <div class="welcome-container flex align-items-center justify-content-center">
    <div class="w-7 grid grid-items">
      <div class="col-12 flex justify-content-center">
        <Header />
      </div>
      <div class="col-12">
        <ProgressBar class="mt-4" :value="value1" />
      </div>
      <div class="col-12">
        <ProgressBar class="mt-4" :value="value1" />
      </div>
    </div>
  </div>
</template>

<script setup>
import Header from '../header/Header.vue'
import ProgressBar from 'primevue/progressbar'
import { ref, onMounted, onBeforeUnmount } from 'vue'

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
    value1.value = newValue
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
