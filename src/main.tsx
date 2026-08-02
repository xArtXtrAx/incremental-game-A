import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GamepadController } from './GamepadController'
import { GamepadEventHaptics } from './GamepadEventHaptics'
import { PulseTriggerSystem } from './PulseTriggerSystem'

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
    <PulseTriggerSystem />
    <GamepadController />
    <GamepadEventHaptics />
  </StrictMode>,
)
