import { createApp } from 'vue'
import App from './App.vue'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import Tooltip from 'primevue/tooltip'
import Particles from '@tsparticles/vue3'
import { loadSlim } from '@tsparticles/slim'
import 'primevue/resources/themes/lara-light-green/theme.css'
import 'primeflex/primeflex.css'
import 'primeicons/primeicons.css'
import './assets/css/style.css'
import store from './store'

const app = createApp(App)
app.directive('tooltip', Tooltip)
app.use(PrimeVue)
app.use(ToastService)
app.use(ConfirmationService)
app.use(store)
app.use(Particles, {
  init: async (engine) => {
    await loadSlim(engine)
  }
})

app.mount('#app')
