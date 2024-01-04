// Vitest unit test spec file

import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { mount } from '@vue/test-utils'
import MarkdownContent from './MarkdownContent.vue'
import { MODE_INJECTION_KEY } from '@/injection-keys'
import type { MarkdownMode } from '@/types'

// Provide data to be received in the `setup` function via `inject`
// Defaults are provided
const setProvideData = (
  { mode = 'read' }:
  { mode?: MarkdownMode },
) => ({
  // Bind the Symbol() as dynamic keys <https://test-utils.vuejs.org/api/#global-provide>
  [MODE_INJECTION_KEY]: ref(mode), // Note: split mode will be automatically switched to edit basd on the viewport
})

describe('<MarkdownContent />', () => {
  it('renders the `content` prop as html', async () => {
    const title = 'Markdown Header'
    const sentence = 'This is markdown content'
    const content = `<h1>${title}</h1>
    <p data-testid="paragraph-1">${sentence}</p>
    `

    const wrapper = mount(MarkdownContent, {
      global: {
        provide: setProvideData({
          mode: 'read',
        }),
      },
      props: {
        content,
      },
    })

    expect(wrapper.findTestId('markdown-content').isVisible()).toBe(true)
    expect(wrapper.find('h1').text()).toEqual(title)
    expect(wrapper.findTestId('paragraph-1').isVisible()).toBe(true)
    expect(wrapper.findTestId('paragraph-1').text()).toEqual(sentence)
  })

  // Loop through each mode
  for (const mode of ['read', 'edit', 'split', 'preview']) {
    it(`adds the 'mode-${mode}' class`, async () => {
      const title = 'Markdown Header'
      const content = `<h1>${title}</h1>`

      const wrapper = mount(MarkdownContent, {
        global: {
          provide: setProvideData({
            mode: mode as MarkdownMode,
          }),
        },
        props: {
          content,
        },
      })

      expect(wrapper.findTestId('markdown-content').isVisible()).toBe(true)
      expect(wrapper.findTestId('markdown-content').classes(`mode-${mode}`)).toBe(true)
      expect(wrapper.find('h1').text()).toEqual(title)
    })
  }
})
