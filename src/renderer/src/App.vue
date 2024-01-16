<script setup>
import { onMounted, onBeforeUnmount, ref, computed, watch, watchEffect } from 'vue'
const { ipcRenderer } = window.electron
import Header from '@renderer/components/header/Header.vue'
import Status from '@renderer/components/header/Status.vue'
import TerminalService from 'primevue/terminalservice'
import SwitchTheme from '@renderer/components/header/SwitchTheme.vue'
import Button from 'primevue/button'
import store from './store'

const terminalText = computed(() => store.getters.getMessage)
console.log(store)
onMounted(() => {
  TerminalService.on('command', commandHandler)
  console.log(ipcRenderer)
})

onBeforeUnmount(() => {
  TerminalService.off('command', commandHandler)
})

const commandHandler = (text) => {
  let response
  let argsIndex = text.indexOf(' ')
  let command = argsIndex !== -1 ? text.substring(0, argsIndex) : text
  response = '🚀 $ ' + text
  // switch (command) {
  //   case 'date':
  //     response = 'Today is ' + new Date().toDateString()
  //     break

  //   case 'greet':
  //     response = 'Hola ' + text.substring(argsIndex + 1)
  //     break

  //   case 'random':
  //     response = Math.floor(Math.random() * 100)
  //     break

  //   default:
  //     response = '🚀 $ ' + command
  // }

  TerminalService.emit('response', response)
}

const started = ref(false)
const startWatch = async () => {
  if (!started.value) {
    started.value = true

    try {
      await window.electron.ipcRenderer.invoke('startFileWatcher')
    } catch (error) {
      console.log('Error starting file watcher:', error)
    }
  }
}

const stopWatch = async () => {
  started.value = false

  try {
    await window.electron.ipcRenderer.invoke('stopFileWatcher')
  } catch (error) {
    console.log('Error stopping the file watcher', error)
  }
}

const terminalMessages = ref([])

ipcRenderer.on('data-to-vue', (event, data) => {
  console.log('date received in vue component', data)
  terminalMessages.value.push(data)

  setTimeout(scrollToBottom, 500)
})

const scrollToBottom = () => {
  const div = document.getElementById('myDiv')
  div.scrollTo({
    top: div.scrollHeight,
    behavior: 'smooth'
  })
}

const scrollToTop = () => {
  const div = document.getElementById('myDiv')
  div.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}
</script>

<template>
  <div class="grid">
    <div class="col-12">
      <div class="flex justify-content-between align-items-center gap-2 px-4">
        <SwitchTheme :started="started" />
        <Status :started="started" />
      </div>
    </div>
    <div class="col-12">
      <div class="flex justify-content-center">
        <div>
          <Header />
          <!-- <pre>{{ terminalMessages }}</pre> -->
        </div>
      </div>
      <div class="flex justify-content-center">
        <span class="text-3xl font-semibold mt-3">RIS File Watcher</span>
      </div>
    </div>
    <div class="col-12">
      <div class="flex justify-content-center gap-2">
        <Button label="Start" icon="pi pi-play" @click="startWatch()" v-if="!started" />
        <Button
          class=""
          label="Stop"
          icon="pi pi-stop"
          severity="danger"
          @click="stopWatch()"
          v-else
        />
      </div>
    </div>
    <div class="col-12 mt-0">
      <div class="flex align-items-center justify-content-end gap-2 px-4 mb-2 mt-0">
        <i class="pi pi-spin pi-spinner text-xs" style="font-size: 1rem"></i
        ><span>File Watcher is running...</span>
      </div>
      <div class="terminal-container bg-gray-900 text-white border-round py-3 px-3 text-gray-400">
        <p class="my-0 text-sm" id="myDiv">
          <span>🚀 $> Welcome to RIS File Watcher <br /></span>
          <span v-for="(t, index) in terminalMessages" :key="index" :class="`${t.color}`"
            >🚀 $> {{ t.text }} <br
          /></span>
        </p>
      </div>
    </div>
    <div class="col-12">
      <div class="flex justify-content-end px-4">
        <span class="text-xs"
          >RIS File Watcher v.1.0 @build Electron v28.1.2 @Joenell Alonzo (Software Engineer)</span
        >
      </div>
    </div>
  </div>
</template>

<style>
#myDiv {
  width: 100%;
  height: 150px;
  overflow-y: scroll;
}

#myDiv::-webkit-scrollbar {
  width: 8px; /* Adjust the width as needed */
}

#myDiv::-webkit-scrollbar-thumb {
  background-color: #6bd4b1;
  border-radius: 4px;
}

#myDiv::-webkit-scrollbar-track {
  background-color: #ffffff;
  padding-left: 10px;
  border-radius: 4px;
}

.terminal-container {
  margin: 0 25px 0 25px !important;
}
</style>
