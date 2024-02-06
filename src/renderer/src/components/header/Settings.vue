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
      header="Settings"
      :style="{ width: '50rem' }"
      :breakpoints="{ '1199px': '75vw', '575px': '90vw', '900px': '50vw' }"
    >
      <span class="p-text-secondary block text-sm mb-3">Update Settings</span>
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
          <label for="destination" class="font-semibol d w-6rem">Orders Directory </label>
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
            size="small"
            :pt="{
              root: { class: 'cst-font-sm' }
            }"
            @click="visible = false"
          ></Button>
          <Button
            class="p-button-sm"
            type="button"
            label="Apply Changes"
            size="small"
            :pt="{
              root: { class: 'cst-font-sm' }
            }"
            @click="saveSettings()"
          ></Button>
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
  await window.electron.ipcRenderer.invoke('showSettings')
  visible.value = true
}

ipcRenderer.on('settings-to-vue', (event, data) => {
  currentSettings.value = data
  console.log('data received in vue settings component', data)
})

const flag = ref(false)
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
}

onMounted(() => {
  flag.value = false
})
</script>

<style lang="scss" scoped>
.cst-font-sm {
  font-size: 0.7rem !important;
  padding: 5px 10px !important;
}
</style>
