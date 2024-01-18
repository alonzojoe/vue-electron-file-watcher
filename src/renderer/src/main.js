import { createApp } from 'vue'
import App from './App.vue'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import 'primevue/resources/themes/lara-light-green/theme.css'
import 'primeflex/primeflex.css'
import 'primeicons/primeicons.css'
import './assets/css/style.css'
import store from './store'
const app = createApp(App)
app.use(PrimeVue)
app.use(ToastService)
app.use(ConfirmationService)
app.use(store)
app.mount('#app')
