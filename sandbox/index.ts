import { createApp } from 'vue'
import App from './App.vue'
// Monaco editor
import * as monaco from 'monaco-editor'
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import CssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import HtmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

// Global MDC components
import MdcAlert from './components/mdc/MdcAlert.vue'
import MdcCard from './components/mdc/MdcCard.vue'
import MdcFlex from './components/mdc/MdcFlex.vue'
import MdcGrid from './components/mdc/MdcGrid.vue'
import MdcGridItem from './components/mdc/MdcGridItem.vue'
import MdcTabs from './components/mdc/MdcTabs.vue'

// @ts-ignore
self.MonacoEnvironment = {
  getWorker(_: any, label: string) {
    if (label === 'json') {
      return new JsonWorker()
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new CssWorker()
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new HtmlWorker()
    }
    if (label === 'typescript' || label === 'javascript') {
      return new TsWorker()
    }
    return new EditorWorker()
  },
}

monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true)

const app = createApp(App)

app.component('MdcAlert', MdcAlert)
app.component('MdcCard', MdcCard)
app.component('MdcFlex', MdcFlex)
app.component('MdcGrid', MdcGrid)
app.component('MdcGridItem', MdcGridItem)
app.component('MdcTabs', MdcTabs)

app.mount('#app')
