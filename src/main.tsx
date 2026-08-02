import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './ChromaticChamberGuard.css'
import './ChromaticDeveloperPreview.css'
import './DeveloperChromaticAccess.css'
import App from './App.tsx'
import { ChromaticChamberSystem } from './ChromaticChamberSystem'
import { ChromaticGamepadBridge } from './ChromaticGamepadBridge'
import { GamepadController } from './GamepadController'
import { GamepadEventHaptics } from './GamepadEventHaptics'
import { PulseTriggerSystem } from './PulseTriggerSystem'
import { RegionFocusGuide } from './RegionFocusGuide'
import { UpgradeProgressSystem } from './UpgradeProgressSystem'
import './PulseTriggerLevel.css'

const editableSelector =
  'input, textarea, [contenteditable="true"], [data-allow-selection="true"]'

document.addEventListener('selectstart', (event) => {
  const target = event.target

  if (target instanceof Element && target.closest(editableSelector)) {
    return
  }

  event.preventDefault()
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <RegionFocusGuide />
    <PulseTriggerSystem />
    <UpgradeProgressSystem />
    <ChromaticChamberSystem />
    <GamepadController />
    <ChromaticGamepadBridge />
    <GamepadEventHaptics />
  </StrictMode>,
)
