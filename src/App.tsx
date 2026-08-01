import { useState } from 'react'
import { motion } from 'motion/react'
import './App.css'

function App() {
  const [clicks, setClicks] = useState(0)

  function handleClick() {
    setClicks((currentClicks) => currentClicks + 1)
  }

  return (
    <main className="game-screen">
      <section className="game-panel">
        <h1>Incremental Game A</h1>

        <p className="instructions">
          Presiona el botón para generar energía.
        </p>

        <motion.button
          type="button"
          className="click-button"
          onClick={handleClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          aria-label="Generar un click"
        >
          CLICK
        </motion.button>

        <div className="click-counter">
          <span>Clicks</span>
          <strong>{clicks}</strong>
        </div>
      </section>
    </main>
  )
}

export default App