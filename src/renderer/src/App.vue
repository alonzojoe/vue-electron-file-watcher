<script setup>
import { onMounted, onBeforeUnmount, ref, computed, watch, onUnmounted } from 'vue'
import Welcome from '@renderer/components/starter/Welcome.vue'
import Header from '@renderer/components/header/Header.vue'
import Status from '@renderer/components/header/Status.vue'
import Terminal from '@renderer/components/cmd/Terminal.vue'
import SwitchTheme from '@renderer/components/header/SwitchTheme.vue'
import Particles from '@renderer/components/particles/Particles.vue'
import Button from 'primevue/button'
import Toast from 'primevue/toast'
import Image from 'primevue/image'
import moment from 'moment'
import ConfirmDialog from 'primevue/confirmdialog'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
const { ipcRenderer } = window.electron

const toast = useToast()
const confirm = useConfirm()

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
      toast.add({
        severity: 'success',
        summary: 'Message',
        detail: 'File Watcher Started.',
        life: 3000
      })
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

const confirmStop = () => {
  confirm.require({
    group: 'positioned',
    message: 'Are you sure you want to stop the File Watcher?',
    header: 'Confirmation',
    icon: 'pi pi-info-circle',
    position: 'left',
    accept: () => {
      stopWatch()
      toast.add({
        severity: 'error',
        summary: 'Message',
        detail: 'File Watcher Stopped.',
        life: 3000
      })
    },
    reject: () => {}
  })
}

const terminalMessages = ref([
  {
    color: 'fc-white',
    text: 'Welcome to RIS File Watcher'
  }
])

ipcRenderer.on('data-to-vue', (event, data) => {
  console.log('data received in vue component', data)
  terminalMessages.value.push(data)
})

ipcRenderer.on('toast-to-vue', (event, data) => {
  console.log('toast message received in vue component', data)

  showSuccess(data)
})

const mainMenu = ref(false)
const showMain = (event) => {
  mainMenu.value = true
}

const currentTheme = ref('')
const getTheme = (theme) => {
  currentTheme.value = theme
}

const clearTerminal = () => {
  terminalMessages.value = [
    {
      color: 'fc-white',
      text: 'The terminal was cleared.'
    }
  ]
}

let intervalId

const startInterval = () => {
  intervalId = setInterval(() => {
    clearTerminal()
  }, moment.duration(8, 'hours').asMilliseconds())
}

const stopInterval = () => {
  clearInterval(intervalId)
}

onMounted(() => {
  startInterval()
  console.log(ipcRenderer)
})

onBeforeUnmount(() => {
  stopInterval()
})

import icon from '../../../resources/vite.svg'
</script>

<template>
  <Particles />
  <Welcome @show-main="showMain($event)" v-if="!mainMenu" />
  <div class="grid fadein animation-duration-1000 relative" v-show="mainMenu">
    <div class="icon-container">
      <img class="vue-icon" height="35px" width="35px" :src="icon" alt="" />
    </div>

    <Toast />
    <ConfirmDialog group="positioned"></ConfirmDialog>
    <div class="col-12">
      <div class="flex justify-content-between align-items-center gap-2 px-2">
        <SwitchTheme @current-theme="getTheme" :started="started" />
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
          @click="confirmStop()"
          v-else
        />
      </div>
    </div>
    <div class="col-12 mt-0">
      <Terminal :messages="terminalMessages" :started="started" @clear-terminal="clearTerminal()" />
    </div>
    <div class="col-12">
      <div class="flex justify-content-end px-4">
        <span class="text-xs"
          >RIS File Watcher v.1.0.0 @build Electron v28.1.2 @Joenell Alonzo (Software
          Engineer)</span
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

.p-dialog .p-dialog-content {
  padding: 0 1.5rem 1rem 1.5rem !important;
}

.p-dialog .p-dialog-header {
  padding: 1rem !important;
}

.p-confirm-dialog-message {
  font-size: 0.7rem;
}

.icon-container {
  position: absolute;
  display: flex;
  text-align: center;
  align-items: center;
  justify-content: center;
  top: 20%;
  right: 70%;
  transform: translate(-50%, -50%);
  width: 45px;
  height: 45px;
  background: rgba(186, 188, 194, 0.5);
  border-radius: 50%;
  opacity: 1;
  animation:
    bounce 5s infinite,
    glow 3s infinite;
}

.icon-container .vue-icon {
  padding: 3px;
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-12px);
  }
  60% {
    transform: translateY(-7px);
  }
}

@keyframes glow {
  0%,
  100% {
    box-shadow: 0 0 10px rgba(200, 200, 200, 0.7); /* Light gray glow with 0.7 opacity */
  }
  50% {
    box-shadow: 0 0 40px rgba(200, 200, 200, 0.2); /* Increase glow size and reduce opacity */
  }
}
</style>
