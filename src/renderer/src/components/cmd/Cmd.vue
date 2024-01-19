<template>
  <div class="terminal-container bg-gray-900 text-white border-round py-3 px-3 text-gray-400">
    <p class="my-0 text-sm" id="terminal-content">
      <span>🚀 $ Welcome to RIS File Watcher <br /></span>
      <span v-for="(m, index) in messages" :key="index" :class="`${m.color}`"
        >🚀 $ {{ m.text }} <br
      /></span>
    </p>
  </div>
</template>

<script setup>
import { watch } from 'vue'
const props = defineProps({
  messages: Array
})

const scrollToBottom = () => {
  const div = document.getElementById('terminal-content')
  div.scrollTo({
    top: div.scrollHeight,
    behavior: 'smooth'
  })
}

watch(props.messages, () => {
  console.log('test')
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
</style>
