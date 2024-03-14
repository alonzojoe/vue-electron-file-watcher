<template>
  <div>
    <Button
      icon="pi pi-cog"
      v-tooltip.right="{
        value: `Update settings`,
        pt: {
          text: 'p-2 font-sm'
        }
      }"
      rounded
      aria-label="Filter"
      :pt="{
        root: { class: 'h-2rem w-2rem z-5 relative' }
      }"
      @click="showSettings()"
    />
    <Dialog
      v-model:visible="visible"
      modal
      :header="!flag ? 'Settings' : ''"
      :style="{ width: '50rem' }"
      :breakpoints="{ '1199px': '75vw', '575px': '90vw', '900px': '50vw' }"
    >
      <div v-if="!succed">
        <span class="p-text-secondary block text-sm mb-3">System Configuration</span>
        <div class="px-5">
          <div class="flex align-items-center gap-3 mb-3">
            <label for="orders" class="font-semibold w-6rem">Orders Directory </label>
            <InputText
              id="orders"
              v-model="currentSettings.orders_directory"
              class="flex-auto"
              :class="{ 'p-invalid': flag && currentSettings.orders_directory.trim().length === 0 }"
              autocomplete="off"
              size="small"
            />
          </div>
          <div class="flex align-items-center gap-3 mb-3">
            <label for="destination" class="font-semibol d w-6rem">Target Directory </label>
            <InputText
              id="destination"
              v-model="currentSettings.target_directory"
              class="flex-auto"
              :class="{ 'p-invalid': flag && currentSettings.target_directory.trim().length === 0 }"
              autocomplete="off"
              size="small"
            />
          </div>
          <div class="flex align-items-center gap-3 mb-3">
            <label for="api" class="font-semibol d w-6rem">API Endpoint </label>
            <InputText
              id="api"
              v-model="currentSettings.api_endpoint"
              class="flex-auto"
              :class="{ 'p-invalid': flag && currentSettings.api_endpoint.trim().length === 0 }"
              autocomplete="off"
              size="small"
            />
          </div>
          <div class="flex justify-content-end gap-2">
            <Button
              class="p-button-sm"
              type="button"
              label="Cancel"
              severity="secondary"
              :disabled="invoked"
              size="small"
              :pt="{
                root: { class: 'cst-font-sm' }
              }"
              @click="visible = false"
            ></Button>
            <Button
              class="p-button-sm"
              type="button"
              :label="invoked ? 'Applying Changes...' : 'Apply Changes'"
              size="small"
              :icon="{ 'pi pi-spin pi-spinner': invoked }"
              :disabled="invoked"
              :pt="{
                root: { class: 'cst-font-sm' }
              }"
              @click="saveSettings()"
            ></Button>
          </div>
        </div>
      </div>
      <div v-else>
        <div class="px-5">
          <div class="flex align-items-center justify-content-center mb-3">
            <img height="150px" width="150px" :src="icon" alt="" />
          </div>
          <div class="flex justify-content-center flex-column align-items-center">
            <p class="text-xl text-center text-green-500 mt-0">Settings updated successfully.</p>
            <p class="text-lg mt-0 text-center font-medium text-red-500 mb-2">
              Please relaunch the file watcher to apply the changes.
            </p>
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { watch, ref, onMounted } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const props = defineProps(['icon'])

const { ipcRenderer } = window.electron
const visible = ref(false)

const currentSettings = ref({
  id: 1,
  orders_directory: '',
  target_directory: '',
  api_endpoint: ''
})

const validateSettings = () => {
  return Object.entries(currentSettings.value).every(
    ([key, value]) => key === 'id' || (typeof value === 'string' && value.trim().length > 0)
  )
}

const showSettings = async () => {
  resetStates()
  await window.electron.ipcRenderer.invoke('showSettings')
  visible.value = true
}

ipcRenderer.on('settings-to-vue', (event, data) => {
  currentSettings.value = data
  console.log('data received in vue settings component', data)
})

const invoked = ref(false)
const invokeUpdate = async (data) => {
  invoked.value = true
  const serializedData = JSON.stringify(data)
  await window.electron.ipcRenderer.invoke('updateSettings', serializedData)
}

const flag = ref(false)
const succed = ref(false)
const saveSettings = async () => {
  flag.value = true
  if (!validateSettings()) {
    console.log('validation failed')
    toast.add({
      severity: 'error',
      summary: 'Message',
      detail: 'Settings validation failed.',
      life: 3000
    })
    return
  }
  console.log('validated!')
  await invokeUpdate(currentSettings.value)
  setTimeout(() => {
    succed.value = true
  }, 2000)
}

const resetStates = () => {
  invoked.value = false
  succed.value = false
  flag.value = false
}

onMounted(() => {
  resetStates()
})
</script>

<style lang="scss" scoped>
.cst-font-sm {
  font-size: 0.7rem !important;
  padding: 5px 10px !important;
}
</style>
