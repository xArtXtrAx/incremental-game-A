import { useRef, useState } from 'react'
import { motion } from 'motion/react'
import './App.css'

type ClickBurst = {
  id: number
}

const particleDirections = [
  { x: 0, y: -82 },
  { x: 58, y: -58 },
  { x: 82, y: 0 },
  { x: 58, y: 58 },
  { x: 0, y: 82 },
  { x: -58, y: 58 },
  { x: -82, y: 0 },
  { x: -58, y: -58 },
]

function App() {
  const [clicks, setClicks] = useState(0)
  const [bursts, setBursts] = useState<ClickBurst[]>([])
  const nextBurstId = useRef(0)

  function handleClick() {
    const burstId = nextBurstId.current
    nextBurstId.current += 1

    setClicks((currentClicks) => currentClicks + 1)
    setBursts((currentBursts) => [...currentBursts, { id: burstId }])

    window.setTimeout(() => {
      setBursts((currentBursts) =>
        currentBursts.filter((burst) => burst.id !== burstId),
      )
    }, 850)
  }

  return (
    <main className="game-screen">
      <section className="game-panel">
        <h1>Incremental Game A</h1>

        <p className="instructions">
          Presiona el botón para generar energía.
        </p>

        <div className="button-stage">
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

          {bursts.map((burst) => (
            <div className="click-burst" key={burst.id} aria-hidden="true">
              <motion.span
                className="click-plus-one"
                initial={{ opacity: 0, scale: 0.65, y: 0 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  scale: [0.65, 1.08, 1],
                  y: -92,
                }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              >
                +1
              </motion.span>

              {particleDirections.map((direction, index) => (
                <motion.span
                  className="click-particle"
                  key={index}
                  initial={{ opacity: 0, scale: 0.25, x: 0, y: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.25, 1.15, 0.2],
                    x: direction.x,
                    y: direction.y,
                  }}
                  transition={{ duration: 0.65, ease: 'easeOut' }}
                />
              ))}
            </div>
          ))}
        </div>

        <div className="click-counter" aria-live="polite">
          <span>Clicks</span>
          <strong>{clicks}</strong>
        </div>
      </section>
    </main>
  )
}

export default App
