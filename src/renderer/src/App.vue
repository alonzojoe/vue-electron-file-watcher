<script setup>
import { onMounted, onBeforeUnmount, ref, computed, watch, onUnmounted } from 'vue'
const { ipcRenderer } = window.electron
import Welcome from '@renderer/components/starter/Welcome.vue'
import Header from '@renderer/components/header/Header.vue'
import Status from '@renderer/components/header/Status.vue'
import SwitchTheme from '@renderer/components/header/SwitchTheme.vue'
import TerminalService from 'primevue/terminalservice'
import Button from 'primevue/button'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'

const toast = useToast()

onBeforeUnmount(() => {
  TerminalService.off('command', commandHandler)
})

const commandHandler = (text) => {
  let response
  let argsIndex = text.indexOf(' ')
  let command = argsIndex !== -1 ? text.substring(0, argsIndex) : text
  response = '🚀 $ ' + text
  TerminalService.emit('response', response)
}
const showSuccess = (data) => {
  toast.add({
    severity: 'success',
    summary: 'Message',
    detail: `${data}`,
    life: 40000 //40 secs
  })
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
  console.log('data received in vue component', data)
  terminalMessages.value.push(data)

  setTimeout(scrollToBottom, 500)
})

ipcRenderer.on('toast-to-vue', (event, data) => {
  console.log('toast message received in vue component', data)

  showSuccess(data)
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

const mainMenu = ref(false)
const showMain = (event) => {
  mainMenu.value = true
}

onMounted(() => {
  TerminalService.on('command', commandHandler)
  console.log(ipcRenderer)
})
</script>

<template>
  <Welcome @show-main="showMain($event)" v-if="!mainMenu" />
  <div class="grid fadein animation-duration-1000" v-show="mainMenu">
    <Toast />
    <div class="col-12">
      <div class="flex justify-content-between align-items-center gap-2 px-2">
        <SwitchTheme :started="started" />
        <Status :started="started" />
      </div>
    </div>
    <div class="col-12">
      <div class="flex justify-content-center">
        <div>
          <Header />
        </div>
      </div>
      <div class="flex justify-content-center">
        <span class="text-3xl font-semibold mt-3">RIS File Watcher</span>
      </div>
    </div>
    <div class="col-12">
      <div class="flex justify-content-center gap-2">
        <Button
          class="btn-control"
          label="Start"
          icon="pi pi-play"
          @click="startWatch()"
          v-if="!started"
        />
        <Button
          class="btn-control"
          label="Stop"
          icon="pi pi-stop"
          severity="danger"
          @click="stopWatch()"
          v-else
        />
      </div>
    </div>
    <div class="col-12 mt-0">
      <div class="flex align-items-center justify-content-start gap-2 px-4 mb-2 mt-0">
        <i
          class="pi text-xs"
          :class="!started ? 'pi-circle-fill' : 'pi-spin pi-spinner'"
          style="font-size: 1rem"
        ></i
        ><span>
          {{ !started ? 'File Watcher is currently stopped' : 'File Watcher is running' }}</span
        ><i class="pi pi-cloud-upload" style="font-size: 1rem"></i>
      </div>
      <div class="terminal-container bg-gray-900 text-white border-round py-3 px-3 text-gray-400">
        <p class="my-0 text-sm" id="myDiv">
          <span>🚀 $ Welcome to RIS File Watcher <br /></span>
          <span v-for="(t, index) in terminalMessages" :key="index" :class="`${t.color}`"
            >🚀 $ {{ t.text }} <br
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
  width: 8px;
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

element.style {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1101;
}
.p-toast {
  opacity: 1;
}
.p-component {
  font-family: var(--font-family);
  font-feature-settings: var(--font-feature-settings, normal);
  font-size: 1rem;
  font-weight: normal;
}

.p-toast {
  width: 17rem !important;
  white-space: pre-line !important;
  word-break: break-word !important;
}

.p-component {
  font-size: 0.7rem;
}
.btn-control {
  font-size: 1rem !important;
}

.p-toast .p-toast-message .p-toast-message-content .p-toast-message-icon.p-icon {
  margin-top: 0.1rem !important;
  width: 1rem !important;
  height: 1rem !important;
}

.p-toast.p-component.p-toast-top-right.p-ripple-disabled {
  top: 42px !important;
}
</style>
