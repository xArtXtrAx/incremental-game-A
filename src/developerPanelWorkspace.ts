import { useCallback, useEffect, useState } from 'react'

export const DEVELOPER_PANEL_LAUNCHER_SELECTOR =
  '.developer-panel-launcher-host'
export const DEVELOPER_PANEL_WORKSPACE_SELECTOR =
  '.developer-panel-workspace-host'

export function usePortalHost(selector: string) {
  const find = useCallback(
    () => document.querySelector<HTMLElement>(selector),
    [selector],
  )
  const [host, setHost] = useState<HTMLElement | null>(() => find())

  useEffect(() => {
    const update = () => setHost(find())
    update()

    const observer = new MutationObserver(update)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [find])

  return host
}

export function useDeveloperPanelLauncherHost() {
  return usePortalHost(DEVELOPER_PANEL_LAUNCHER_SELECTOR)
}

export function useDeveloperPanelWorkspaceHost() {
  return usePortalHost(DEVELOPER_PANEL_WORKSPACE_SELECTOR)
}
