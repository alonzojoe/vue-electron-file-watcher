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
})
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
          <pre>{{ terminalMessages }}</pre>
        </div>
      </div>
      <div class="flex justify-content-center">
        <span class="text-5xl font-semibold mt-3">RIS File Watcher</span>
      </div>
    </div>
    <div class="col-12">
      <div class="flex justify-content-center mb-3 gap-2">
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
      <div class="flex align-items-center justify-content-center px-5">
        <ScrollPanel
          class="bg-gray-900 text-white border-round p-2 px-3 text-gray-400"
          style="width: 100%; height: 180px"
          :pt="{
            bary: 'hover:bg-primary-400 bg-primary-300 opacity-100'
          }"
        >
          <p>
            <span>Welcome to RIS File Watcher</span> <br />
            <span>File Watcher Started...</span> <br />
            <span class="fc-green"
              >🚀 $ Patient 0952214 De Jesus Juan CT Scan Results has been uploaded to Edify.</span
            >
            <br />
            <span class="fc-red"
              >🚀 $ Unable to Process Patient 0952214 De Dios Maria CT Scan Results, error: File
              Name Format.</span
            >
            <br />
            <span class="fc-red"
              >🚀 $ Unable to Process Patient 0952214 De Dios Maria CT Scan Results, error: File
              Name Format.</span
            >
            <br />
            <span class="fc-red"
              >🚀 $ Unable to Process Patient 0952214 De Dios Maria CT Scan Results, error: File
              Name Format.</span
            >
            <br />
            <span class="fc-red"
              >🚀 $ Unable to Process Patient 0952214 De Dios Maria CT Scan Results, error: File
              Name Format.</span
            >
            <br />
            <span class="fc-green"
              >🚀 $ Patient 0952214 De Jesus Juan CT Scan Results has been uploaded to Edify.</span
            >
            <br />
            <span class="fc-green"
              >🚀 $ Patient 0952214 De Jesus Juan CT Scan Results has been uploaded to Edify.</span
            >
            <br />
            <span class="fc-green"
              >🚀 $ Patient 0952214 De Jesus Juan CT Scan Results has been uploaded to Edify.</span
            >
            <br />
            <span class="fc-yellow">🚀 $ Attemting to Re-scan the Orders folder</span> <br />
            <span class="fc-red">🚀 $ File Watcher Stopped...</span> <br />
          </p>
        </ScrollPanel>
      </div>
      <div>
        <!-- <Terminal
          welcomeMessage="Welcome to RIS File Watcher"
          prompt="🚀 $"
          aria-label="PrimeVue Terminal Service"
          :pt="{
            root: 'bg-gray-900 text-white border-round',
            prompt: 'text-gray-400 mr-2',
            command: 'text-primary-300',
            response: 'text-primary-300'
          }"
        /> -->
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

<style></style>
