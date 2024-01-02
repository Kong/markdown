import type { DOMWrapper } from '@vue/test-utils'

declare module '@vue/test-utils' {
  export class VueWrapper {
    findTestId(dataTestid: string): DOMWrapper;
  }
}
