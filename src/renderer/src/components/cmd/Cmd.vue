<template>
  <template>
    <div class="flex justify-content-center flex-wrap">
      <Terminal
        welcomeMessage="Welcome to PrimeVue"
        prompt="primevue $"
        aria-label="PrimeVue Terminal Service"
        :pt="{
          root: 'bg-gray-900 text-white border-round',
          prompt: 'text-gray-400 mr-2',
          command: 'text-primary-300',
          response: 'text-primary-300'
        }"
      />
    </div>
  </template>
</template>

<script setup>
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

<style lang="scss" scoped></style>
