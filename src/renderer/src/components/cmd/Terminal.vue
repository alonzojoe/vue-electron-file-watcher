<template>
  <div class="flex align-items-center justify-content-between px-4 mb-2 mt-0">
    <div class="flex gap-2 align-items-center">
      <i
        class="pi text-xs"
        :class="!started ? 'pi-circle-fill' : 'pi-spin pi-spinner'"
        style="font-size: 1rem"
      ></i
      ><span> {{ !started ? 'File Watcher is currently stopped' : 'File Watcher is running' }}</span
      ><i class="pi pi-cloud-upload" style="font-size: 1rem" v-if="started"></i>
    </div>
    <div>
      <Button
        class="p-button-sm"
        label="Clear Terminal"
        severity="danger"
        @click="$emit('clear-terminal')"
        :pt="{
          root: { class: 'cst-font-sm' }
        }"
      />
    </div>
  </div>
  <div class="terminal-container bg-gray-900 text-white border-round py-3 px-3 text-gray-400">
    <p class="my-0 text-sm" id="terminal-content">
      <span v-for="(m, index) in messages" :key="index" :class="`${m.color}`"
        >{{ m.timestamp }} 🚀 $ {{ m.text }} <br
      /></span>
    </p>
  </div>
</template>

<script setup>
import { watch } from 'vue'
import Button from 'primevue/button'
const props = defineProps({
  messages: Array,
  started: Boolean
})

const scrollToBottom = () => {
  const div = document.getElementById('terminal-content')
  div.scrollTo({
    top: div.scrollHeight,
    behavior: 'smooth'
  })
}

watch(props.messages, () => {
  setTimeout(scrollToBottom, 500)
})

console.log('props message', props.messages)
</script>

<style scoped>
#terminal-content {
  width: 100%;
  height: 150px;
  overflow-y: scroll;
}

#terminal-content::-webkit-scrollbar {
  width: 8px;
}

#terminal-content::-webkit-scrollbar-thumb {
  background-color: #6bd4b1;
  border-radius: 4px;
}

#terminal-content::-webkit-scrollbar-track {
  background-color: #ffffff;
  padding-left: 10px;
  border-radius: 4px;
}

.terminal-container {
  margin: 0 25px 0 25px !important;
}

.cst-font-sm {
  font-size: 0.7rem !important;
  padding: 5px 10px !important;
}
</style>
