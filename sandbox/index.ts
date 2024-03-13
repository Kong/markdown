import { createApp } from 'vue'
import App from './App.vue'
import MDCRenderer from '../src/mdc/MDCRenderer.vue'
import MdcTabs from '../src/mdc/MdcTabs.vue'

const app = createApp(App)

app.component('MDCRenderer', MDCRenderer)
app.component('MdcTabs', MdcTabs)

app.mount('#app')
