import { config, DOMWrapper } from '@vue/test-utils'

const DataTestIdPlugin = (wrapper: any) => {
  /** Find element by `data-testid` selector */
  const findTestId = (dataTestid: string): any => {
    const dataSelector = `[data-testid="${dataTestid}"]`
    const element = wrapper.element.querySelector(dataSelector)
    return new DOMWrapper(element)
  }

  return {
    findTestId,
  }
}

config.plugins.VueWrapper.install(DataTestIdPlugin)
