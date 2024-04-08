import { createApp } from 'vue'
import App from './App.vue'

// Global MDC components
import MdcAlert from './components/mdc/MdcAlert.vue'
import MdcCard from './components/mdc/MdcCard.vue'
import MdcFlex from './components/mdc/MdcFlex.vue'
import MdcGrid from './components/mdc/MdcGrid.vue'
import MdcGridItem from './components/mdc/MdcGridItem.vue'
import MdcTabs from './components/mdc/MdcTabs.vue'

const app = createApp(App)

app.component('MdcAlert', MdcAlert)
app.component('MdcCard', MdcCard)
app.component('MdcFlex', MdcFlex)
app.component('MdcGrid', MdcGrid)
app.component('MdcGridItem', MdcGridItem)
app.component('MdcTabs', MdcTabs)

app.mount('#app')
