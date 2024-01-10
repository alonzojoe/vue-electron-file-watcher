import { createApp } from 'vue'
import App from './App.vue'
import PrimeVue from 'primevue/config'
import 'primevue/resources/themes/lara-light-green/theme.css'
import 'primeflex/primeflex.css'
import 'primeicons/primeicons.css'
import './assets/css/style.css'
const app = createApp(App)
app.use(PrimeVue)
app.mount('#app')
