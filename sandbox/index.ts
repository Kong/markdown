import { createApp } from 'vue'
import App from './App.vue'
import MdcTabs from './components/MdcTabs.vue'

const app = createApp(App)

app.component('MdcTabs', MdcTabs)

app.mount('#app')
