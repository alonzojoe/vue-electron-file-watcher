<script setup>
import { onMounted, onBeforeUnmount, ref, computed, watch, onUnmounted, watchEffect } from 'vue'
import Welcome from '@renderer/components/starter/Welcome.vue'
import Header from '@renderer/components/header/Header.vue'
import Status from '@renderer/components/header/Status.vue'
import Terminal from '@renderer/components/cmd/Terminal.vue'
import SwitchTheme from '@renderer/components/header/SwitchTheme.vue'
import Settings from '@renderer/components/header/Settings.vue'
import Particles from '@renderer/components/particles/Particles.vue'
import AnalogClock from '@renderer/components/clock/AnalogClock.vue'
import Button from 'primevue/button'
import Toast from 'primevue/toast'
import Dialog from 'primevue/dialog'
import moment from 'moment'
import ConfirmDialog from 'primevue/confirmdialog'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import laravelIcon from '../../../resources/laravel.png'
import viteIcon from '../../../resources/vite.png'
import vueIcon from '../../../resources/vue.png'
import electronIcon from '../../../resources/icon--2.png'
import snapIcon from '../../../resources/snap.png'
import smileIcon from '../../../resources/snap-smile.png'
import flowProcess from '../../../resources/flow.png'
import fileIcon from '../../../resources/file.png'
import fileIconSlashed from '../../../resources/file-slash.png'

const { ipcRenderer } = window.electron

const formattedDate = ref(moment().format('YYYY-MM-DD HH:mm:ss.SSS'))

const toast = useToast()
const confirm = useConfirm()
const block = ref(true)
const showSuccess = (data) => {
  toast.add({
    severity: 'success',
    summary: 'Message',
    detail: `${data}`,
    life: 55000 //50 secs
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
    reject: () => { }
  })
}

const terminalMessages = ref([
  {
    timestamp: formattedDate.value,
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

ipcRenderer.on('api-not-found', (event, data) => {
  visible.value = data
})

ipcRenderer.on('drive-not-found', (event, data) => {
  errorDrive(data)
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
      timestamp: formattedDate.value,
      color: 'fc-white',
      text: 'The terminal was automatically cleared.'
    }
  ]
}

let intervalId = null;

const startInterval = () => {
  clearInterval(intervalId)


  intervalId = setInterval(() => {
    clearTerminal()
  }, moment.duration(4, 'hours').asMilliseconds())
}

const stopInterval = () => {
  clearInterval(intervalId)
}

onMounted(() => {
  startInterval()
  console.log(ipcRenderer)
})

onUnmounted(() => {
  stopInterval()
})

const visible = ref(false)

const eyedIcon = computed(() => {
  return !started.value ? fileIconSlashed : fileIcon
})

const dialogTitle = ref(`API Endpoint Not Found.`)

const dialogMessage = ref(
  'Check the API server configuration and file watcher settings, then relaunch the file watcher.'
)

const startDisable = ref(false)
const errorDrive = (data) => {
  startDisable.value = true
  dialogTitle.value = `Missing Drive${data.plural}`
  dialogMessage.value = data.message
  visible.value = true
}

onBeforeUnmount(() => {
  stopInterval()
})
</script>

<template>
  <Particles />
  <Dialog v-model:visible="visible" modal :closeOnEscape="false" :close-icon="false" :draggable="false"
    :style="{ width: '50rem' }" :breakpoints="{ '1199px': '75vw', '575px': '90vw', '900px': '50vw' }">
    <div class="flex align-items-center justify-content-center">
      <img height="150px" width="150px" :src="snapIcon" alt="" />
    </div>
    <div class="flex justify-content-center flex-column align-items-center">
      <p class="text-xl font-medium text-red-500 mb-2">Oops! 404 - {{ dialogTitle }}.</p>
      <p class="text-lg text-center mt-0">
        {{ dialogMessage }} Please check if the drive name matches the one saved in the file watcher
        settings and relaunch the file watcher.
      </p>
      <Button class="p-button-sm" type="button" label="Close" size="small" severity="danger" :disabled="invoked" :pt="{
        root: { class: 'cst-font-sm' }
      }" @click="visible = false"></Button>
    </div>
  </Dialog>

  <Welcome @show-main="showMain($event)" v-if="!mainMenu" />
  <div class="grid fadein animation-duration-1000 relative" v-show="mainMenu">
    <div class="icon-container vite">
      <img class="img-icon" height="35px" width="35px" :src="viteIcon" alt="" />
    </div>
    <div class="icon-container laravel">
      <img class="img-icon" height="35px" width="35px" :src="laravelIcon" alt="" />
    </div>
    <div class="icon-container vue">
      <img class="img-icon" height="35px" width="35px" :src="vueIcon" alt="" />
    </div>
    <div class="icon-container electron">
      <img class="img-icon" height="35px" width="35px" :src="electronIcon" alt="" />
    </div>
    <div class="flow-process pe-none">
      <img :src="flowProcess" alt="flow-process" />
    </div>

    <Toast />
    <ConfirmDialog group="positioned"></ConfirmDialog>
    <div class="col-12">
      <div class="flex justify-content-between align-items-center gap-2 px-2">
        <div class="flex gap-2 align-items-center">
          <SwitchTheme @current-theme="getTheme" :started="started" />
          <Settings :icon="smileIcon" />
        </div>
        <div>
          <Status :started="started" />
        </div>
      </div>
    </div>
    <div class="col-12">
      <div class="flex justify-content-center">
        <div>
          <!-- <Header /> -->
          <AnalogClock :bg="'#111827'" :color="'#34D399'" :size="'180px'" :icon="eyedIcon" />
        </div>
      </div>
      <div class="flex justify-content-center">
        <span class="text-3xl font-semibold mt-3">RIS File Watcher</span>
      </div>
    </div>
    <div class="col-12">
      <div class="flex justify-content-center gap-2">
        <Button class="btn-control" label="Start" icon="pi pi-play" :disabled="startDisable" @click="startWatch()"
          v-if="!started" />
        <Button class="btn-control" label="Stop" icon="pi pi-stop" severity="danger" @click="confirmStop()" v-else />
      </div>
    </div>
    <div class="col-12 mt-0">
      <Terminal :messages="terminalMessages" :started="started" @clear-terminal="clearTerminal()" />
    </div>
    <div class="col-12">
      <div class="flex justify-content-end px-4">
        <span class="text-xs">RIS File Watcher v.1.0.0 @build Electron v28.1.2</span>
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
  display: flex;
  text-align: center;
  align-items: center;
  justify-content: center;
  width: 45px;
  height: 45px;
  background: rgba(186, 188, 194, 0.5);
  border-radius: 50%;
  opacity: 1;
  animation:
    bounce 5s infinite,
    glow 3s infinite;
}

.icon-container.vite {
  position: absolute;
  top: 5%;
  right: 78%;
  transform: translate(-50%, -50%);
}

.icon-container.laravel {
  position: absolute;
  top: 18.5%;
  right: 68%;
  transform: translate(-50%, -50%);
}

.icon-container.vue {
  position: absolute;
  top: 16%;
  right: 90%;
  transform: translate(-50%, -50%);
}

.icon-container.electron {
  position: absolute;
  top: 30%;
  right: 80%;
  transform: translate(-50%, -50%);
}

.icon-container .img-icon {
  padding: 3px;
}

.p-dialog-header-icons button {
  display: none;
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
    box-shadow: 0 0 10px rgba(200, 200, 200, 0.7);
  }

  50% {
    box-shadow: 0 0 40px rgba(200, 200, 200, 0.2);
  }
}

.flow-process {
  position: absolute;
  pointer-events: none;
  opacity: 0.1;
  top: 24%;
  right: 4%;
  transform: rotate(-20deg);
}

body {
  overflow-y: hidden;
  overflow-x: hidden;
}
</style>
