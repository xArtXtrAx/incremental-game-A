import { useEffect } from 'react'

const LEGACY_TOOL_SELECTOR = [
  '.developer-balance-access button',
  '.developer-balance-profiles-access button',
  '.developer-chromatic-button',
].join(', ')

export function DeveloperToolLaunchBridge() {
  useEffect(() => {
    const relayProgrammaticToolClick = (event: MouseEvent) => {
      if (event.detail !== 0) return
      if (!document.querySelector('.developer-control-overlay')) return

      const target = event.target
      if (!(target instanceof Element)) return

      const button = target.closest<HTMLButtonElement>(LEGACY_TOOL_SELECTOR)
      if (!button) return

      button.dispatchEvent(
        new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          detail: 1,
          view: window,
        }),
      )
    }

    document.addEventListener('click', relayProgrammaticToolClick, true)
    return () =>
      document.removeEventListener('click', relayProgrammaticToolClick, true)
  }, [])

  return null
}
