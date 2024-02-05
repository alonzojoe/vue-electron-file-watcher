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
      <pre>{{ currentSettings }}</pre>
      <div class="px-5">
        <div class="flex align-items-center gap-3 mb-3">
          <label for="orders" class="font-semibold w-6rem">Orders Directory</label>
          <InputText id="orders" class="flex-auto" autocomplete="off" size="small" />
        </div>
        <div class="flex align-items-center gap-3 mb-3">
          <label for="destination" class="font-semibol d w-6rem">Orders Directory</label>
          <InputText id="destination" class="flex-auto" autocomplete="off" size="small" />
        </div>
        <div class="flex align-items-center gap-3 mb-3">
          <label for="api" class="font-semibol d w-6rem">API Endpoint</label>
          <InputText id="api" class="flex-auto" autocomplete="off" size="small" />
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
            @click="showSettings()"
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

const { ipcRenderer } = window.electron
const visible = ref(false)
const currentSettings = ref({
  id: 1,
  ordersDirectory: '',
  targetDirectory: '',
  electronApiPath: ''
})

const showSettings = async () => {
  await window.electron.ipcRenderer.invoke('showSettings')
  visible.value = true
}

ipcRenderer.on('settings-to-vue', (event, data) => {
  //   currentSettings.value = data
  console.log('data received in vue settings component', data)
})
</script>

<style lang="scss" scoped>
.cst-font-sm {
  font-size: 0.7rem !important;
  padding: 5px 10px !important;
}
</style>
