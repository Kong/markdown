import { onUnmounted } from 'vue'
import type { Ref } from 'vue'
import * as monaco from 'monaco-editor'
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import CssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import HtmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import { language as markdownLanguage } from '../mdc.tmLanguage'

interface UseMonacoOptions {
  textareaId: Ref<string>
  content: Ref<string>
  onChange?: (monacoEditor: monaco.editor.IStandaloneCodeEditor | null) => void
}

let monacoEditor: monaco.editor.IStandaloneCodeEditor

export default function useMonaco(options: UseMonacoOptions) {
  const init = (): void => {
    if (monacoEditor) {
      monacoEditor.dispose()
    }

    // @ts-ignore: MonacoEnvironment exists in the global scope
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

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      ...monaco.languages.typescript.typescriptDefaults.getCompilerOptions(),
      noUnusedLocals: false,
      noUnusedParameters: false,
      allowUnreachableCode: true,
      allowUnusedLabels: true,
      strict: true,
    })

    monaco.languages.register({ id: 'mdc' })
    // Register a tokens provider for the language
    monaco.languages.setMonarchTokensProvider('mdc', markdownLanguage)

    monaco.editor.defineTheme('portal-editor-theme', {
      inherit: true,
      base: 'vs', // 'vs' (default), 'vs-dark', 'hc-black'
      rules: [],
      colors: {},
      // TODO: Customize theme?
      // rules: [
      //   { token: 'keyword', foreground: '#003694', fontStyle: 'bold' },
      //   { token: 'operators', foreground: '#003694', fontStyle: 'bold' },
      //   { token: 'string', foreground: '#009966' },
      //   { token: 'number', foreground: '#009966' },
      //   { token: 'variable', foreground: '#006699' },
      //   { token: 'brackets', foreground: '#993399' },
      // ],
      // colors: {
      //   'editor.foreground': '#000000',
      //   'editor.background': '#ffffff',
      // },
    })

    // Create Monaco editor
    monacoEditor = monaco.editor.create(document.getElementById(options.textareaId.value)!, {
      value: options.content.value,
      language: 'mdc',
      theme: 'portal-editor-theme', // From above
      tabSize: 2,
      lineHeight: 1.6,
      wordWrap: 'on',
      insertSpaces: true, // insert spaces when pressing Tab
      autoClosingQuotes: 'always',
      detectIndentation: false,
      renderWhitespace: 'boundary',
      trimAutoWhitespace: true,
      folding: false,
      glyphMargin: false,
      lineNumbersMinChars: 3,
      overviewRulerLanes: 0,
      automaticLayout: true,
      minimap: {
        enabled: false,
      },
    })

    // Update code ref when editor value changes
    monacoEditor.onDidChangeModelContent(() => {
      if (typeof options?.onChange === 'function') {
        options.onChange(monacoEditor)
      }
    })
  }

  onUnmounted(() => {
    monacoEditor?.dispose()
  })

  return {
    monacoEditor,
    init,
  }
}
