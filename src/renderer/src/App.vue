<script setup>
import Header from '@renderer/components/header/Header.vue'
// import Terminal from '@renderer/components/cmd/Cmd.vue'

import { onMounted, onBeforeUnmount } from 'vue'
import Terminal from 'primevue/terminal'
import TerminalService from 'primevue/terminalservice'

onMounted(() => {
  TerminalService.on('command', commandHandler)
})

onBeforeUnmount(() => {
  TerminalService.off('command', commandHandler)
})

const commandHandler = (text) => {
  let response
  let argsIndex = text.indexOf(' ')
  let command = argsIndex !== -1 ? text.substring(0, argsIndex) : text

  switch (command) {
    case 'date':
      response = 'Today is ' + new Date().toDateString()
      break

    case 'greet':
      response = 'Hola ' + text.substring(argsIndex + 1)
      break

    case 'random':
      response = Math.floor(Math.random() * 100)
      break

    default:
      response = 'Unknown command: ' + command
  }

  TerminalService.emit('response', response)
}
</script>

<template>
  <div class="grid">
    <div class="col-12">
      <div class="flex justify-content-between flex-wrap">
        <div>
          <Header />
        </div>
        <div
          class="flex align-items-center justify-content-center w-4rem h-4rem bg-primary font-bold border-round m-2"
        >
          2
        </div>
        <div
          class="flex align-items-center justify-content-center w-4rem h-4rem bg-primary font-bold border-round m-2"
        >
          3
        </div>
      </div>
    </div>
    <div class="col-12">
      <div>
        <Terminal
          welcomeMessage="Welcome to RIS File Watcher"
          prompt="🚀 $"
          aria-label="PrimeVue Terminal Service"
          :pt="{
            root: 'bg-gray-900 text-white border-round',
            prompt: 'text-gray-400 mr-2',
            command: 'text-primary-300',
            response: 'text-primary-300'
          }"
        />
      </div>
    </div>
  </div>
</template>

<style></style>
