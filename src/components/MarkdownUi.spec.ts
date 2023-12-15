// Vitest unit test spec file

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MarkdownUi from './MarkdownUi.vue'

describe('<MarkdownUi />', () => {
  it('renders', async () => {
    const wrapper = await mount(MarkdownUi)

    expect(wrapper.isVisible()).toBe(true)
  })
})
