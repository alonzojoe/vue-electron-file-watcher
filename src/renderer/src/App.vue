<script setup>
import { onMounted, onBeforeUnmount, ref, computed, watch, watchEffect } from 'vue'
const { ipcRenderer } = window.electron
import Header from '@renderer/components/header/Header.vue'
import Status from '@renderer/components/header/Status.vue'
import Cmd from '@renderer/components/cmd/Cmd.vue'
import Terminal from 'primevue/terminal'
import TerminalService from 'primevue/terminalservice'
import InputSwitch from 'primevue/inputswitch'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Button from 'primevue/button'
import ScrollPanel from 'primevue/scrollpanel'
import store from './store'
// import chokidar from 'chokidar-socket-emitter'
// const store = useStore()
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
      // Send a message to the main process to start the file watcher
      await window.electron.ipcRenderer.invoke('startFileWatcher')
      // await startFileWatcher()
    } catch (error) {
      console.log('Error starting file watcher:', error)
    }
  }
}

// Handle the response from the main process, if needed

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
  // scrollToBottom()
  setTimeout(scrollToBottom, 500)
})

const scrollPanelRef = ref()

const scrollDown = () => {
  // const myDiv = document.getElementById('cmd-text')
  // console.log(myDiv.scrollHeight)
  // console.log(myDiv)
  // myDiv.scrollTo({
  //   top: myDiv.scrollHeight,
  //   behavior: 'smooth'
  // })
  // const myDiv = document.getElementById('cmd-text')

  // if (myDiv) {
  //   // If you want to scroll the window, use document.documentElement or document.body
  //   myDiv.documentElement.scrollTo({
  //     top: myDiv.scrollHeight,
  //     behavior: 'smooth'
  //   })
  // }
  const myDiv = document.getElementById('cmd-text')

  if (myDiv) {
    // If you want to scroll the window, use document.documentElement or document.body
    myDiv.scrollTo({
      top: myDiv.scrollHeight,
      behavior: 'smooth'
    })
  }
}

const scrollToBottom = () => {
  // get the div element by its id
  const div = document.getElementById('myDiv')
  // smooth scroll to the bottom of the div
  div.scrollTo({
    top: div.scrollHeight,
    behavior: 'smooth'
  })
}

// define a function to scroll to the top of the div
const scrollToTop = () => {
  // get the div element by its id
  const div = document.getElementById('myDiv')
  // smooth scroll to the top of the div
  div.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// watch(() => {
//   terminalMessages.value
//   if (terminalMessages) {
//     scrollToBottom()
//   }
// })
</script>

<template>
  <div class="grid">
    <div class="col-12">
      <Status :started="started" />
    </div>
    <div class="col-12">
      <div class="flex justify-content-center">
        <div>
          <Header />
          <!-- <pre>{{ terminalMessages }}</pre> -->
        </div>
      </div>
      <div class="flex justify-content-center">
        <span class="text-5xl font-semibold mt-3">RIS File Watcher</span>
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
    <div class="col-12">
      <div class="terminal-container bg-gray-900 text-white border-round py-3 px-3 text-gray-400">
        <p class="my-0 text-sm" id="myDiv">
          <span>Welcome to RIS File Watcher <br /></span>
          <span v-for="(t, index) in terminalMessages" :key="index" :class="`${t.color}`"
            >🚀 $ {{ t.text }} <br
          /></span>
        </p>
      </div>
    </div>
    <div class="col-12">
      <div class="flex justify-content-end">
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
