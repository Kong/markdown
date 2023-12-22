import type { Ref } from 'vue'

export default function useSyncScroll(scrollableClass: Ref<string>) {
  // Keep scroll containers in sync
  const handleScroll = (e: Event) => {
    const syncScroll = (scrolledEle: Element, ele: Element) => {
      const scrolledPercent = scrolledEle.scrollTop / (scrolledEle.scrollHeight - scrolledEle.clientHeight)
      const top = scrolledPercent * (ele.scrollHeight - ele.clientHeight)

      const scrolledWidthPercent = scrolledEle.scrollLeft / (scrolledEle.scrollWidth - scrolledEle.clientWidth)
      const left = scrolledWidthPercent * (ele.scrollWidth - ele.clientWidth)

      ele.scrollTo({
        behavior: 'instant', // must be instant
        top,
        left,
      })
    }

    const scrolledEle = e.target

    Array.from([...document.querySelectorAll(`.${scrollableClass.value}`)]).filter((item) => item !== scrolledEle).forEach((ele: Element) => {
      ele.removeEventListener('scroll', handleScroll)
      // @ts-ignore
      syncScroll(scrolledEle, ele)
      window.requestAnimationFrame(() => {
        ele.addEventListener('scroll', handleScroll)
      })
    })
  }

  const initializeSyncScroll = (): void => {
    document?.querySelectorAll(`.${scrollableClass.value}`)?.forEach((el) => {
      el?.addEventListener('scroll', handleScroll)
    })
  }

  const destroySyncScroll = (): void => {
    document?.querySelectorAll(`.${scrollableClass.value}`)?.forEach((el) => {
      el?.removeEventListener('scroll', handleScroll)
    })
  }

  return {
    initializeSyncScroll,
    destroySyncScroll,
  }
}
