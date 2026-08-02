import { useEffect, useRef } from 'react'

type Props = {
  depth: 'back' | 'front'
  energized: boolean
  onUnavailable: () => void
}

type OrbitPoint = {
  x: number
  y: number
  z: number
}

const TAU = Math.PI * 2
const RING_POINT_COUNT = 120
const TRAIL_POINT_COUNT = 12
const TRAIL_ARC_FRACTION = 0.18
const FLOATS_PER_POINT = 7

let sharedOrbitPhase = 0
let sharedOrbitTimestamp = 0

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
) {
  const shader = gl.createShader(type)
  if (!shader) throw new Error('No se pudo crear el shader orbital.')

  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) ?? 'Shader orbital inválido.'
    gl.deleteShader(shader)
    throw new Error(message)
  }

  return shader
}

function createProgram(gl: WebGLRenderingContext) {
  const vertexShader = compileShader(
    gl,
    gl.VERTEX_SHADER,
    `
      attribute vec2 aPosition;
      attribute float aSize;
      attribute vec4 aColor;
      varying vec4 vColor;

      void main() {
        gl_Position = vec4(aPosition, 0.0, 1.0);
        gl_PointSize = aSize;
        vColor = aColor;
      }
    `,
  )

  const fragmentShader = compileShader(
    gl,
    gl.FRAGMENT_SHADER,
    `
      precision mediump float;
      varying vec4 vColor;

      void main() {
        vec2 local = gl_PointCoord - vec2(0.5);
        float radius = length(local);
        float core = smoothstep(0.5, 0.0, radius);
        float halo = smoothstep(0.52, 0.12, radius);
        float alpha = vColor.a * max(core, halo * 0.58);
        gl_FragColor = vec4(vColor.rgb, alpha);
      }
    `,
  )

  const program = gl.createProgram()
  if (!program) throw new Error('No se pudo crear el programa orbital.')

  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  gl.deleteShader(vertexShader)
  gl.deleteShader(fragmentShader)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message =
      gl.getProgramInfoLog(program) ?? 'Programa orbital inválido.'
    gl.deleteProgram(program)
    throw new Error(message)
  }

  return program
}

function attribute(
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  name: string,
) {
  const location = gl.getAttribLocation(program, name)
  if (location < 0) throw new Error(`Atributo orbital no encontrado: ${name}`)
  return location
}

function projectOrbitPoint(angle: number): OrbitPoint {
  const x3d = Math.cos(angle)
  const z3d = Math.sin(angle)
  const perspective = 1 + z3d * 0.1

  return {
    x: x3d * 0.82 * perspective,
    y: -z3d * 0.57 * perspective,
    z: z3d,
  }
}

function isVisibleAtDepth(point: OrbitPoint, depth: Props['depth']) {
  return depth === 'front' ? point.z >= 0 : point.z < 0
}

function readDuration(host: HTMLElement | null) {
  const rawDuration =
    host?.style.getPropertyValue('--sapphire-pulse-duration') ?? ''
  const duration = Number.parseFloat(rawDuration)
  return Number.isFinite(duration) && duration > 0 ? duration : 20
}

function getSharedOrbitPhase(now: number, duration: number) {
  if (sharedOrbitTimestamp === 0) {
    sharedOrbitTimestamp = now
    return sharedOrbitPhase
  }

  const deltaSeconds = Math.min(
    0.1,
    Math.max(0, (now - sharedOrbitTimestamp) / 1000),
  )
  sharedOrbitTimestamp = now
  sharedOrbitPhase = (sharedOrbitPhase + deltaSeconds / duration) % 1
  return sharedOrbitPhase
}

function readPulse(host: HTMLElement | null) {
  const rawPulse = host?.style.getPropertyValue('--sapphire-pulse') ?? ''
  const pulse = Number.parseFloat(rawPulse)
  return Number.isFinite(pulse) ? Math.min(1, Math.max(0.5, pulse)) : 1
}

function buildOrbitVertices(
  depth: Props['depth'],
  phase: number,
  pulse: number,
  energized: boolean,
  pixelRatio: number,
) {
  const values: number[] = []
  const depthBrightness = depth === 'front' ? 1 : 0.56
  const energyBoost = energized ? 1.2 : 1

  const pushPoint = (
    point: OrbitPoint,
    size: number,
    red: number,
    green: number,
    blue: number,
    alpha: number,
  ) => {
    if (!isVisibleAtDepth(point, depth)) return
    values.push(
      point.x,
      point.y,
      size * pixelRatio,
      red,
      green,
      blue,
      alpha * depthBrightness,
    )
  }

  for (let index = 0; index < RING_POINT_COUNT; index += 1) {
    const angle = (index / RING_POINT_COUNT) * TAU
    const point = projectOrbitPoint(angle)
    const ringPulse = 0.72 + pulse * 0.28

    pushPoint(
      point,
      depth === 'front' ? 2.45 : 2.1,
      0.28,
      0.82,
      1,
      0.18 * ringPulse * energyBoost,
    )
  }

  const sparkAngle = phase * TAU
  const trailArc = TAU * TRAIL_ARC_FRACTION

  for (let index = TRAIL_POINT_COUNT; index >= 1; index -= 1) {
    const distance = index / TRAIL_POINT_COUNT
    const angle = sparkAngle - trailArc * distance
    const point = projectOrbitPoint(angle)
    const proximity = 1 - distance
    const alpha = (0.08 + proximity * 0.5) * (0.76 + pulse * 0.24)
    const size = 5.5 + proximity * 6.5

    pushPoint(point, size, 0.3, 0.84, 1, alpha * energyBoost)
  }

  const spark = projectOrbitPoint(sparkAngle)
  pushPoint(
    spark,
    energized ? 21 : 17,
    0.22,
    0.82,
    1,
    (energized ? 0.56 : 0.42) * (0.8 + pulse * 0.2),
  )
  pushPoint(
    spark,
    energized ? 8 : 6.5,
    0.96,
    1,
    1,
    1,
  )

  return new Float32Array(values)
}

export function SapphireOrbit3D({ depth, energized, onUnavailable }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const energizedRef = useRef(energized)
  const unavailableRef = useRef(onUnavailable)

  useEffect(() => {
    energizedRef.current = energized
  }, [energized])

  useEffect(() => {
    unavailableRef.current = onUnavailable
  }, [onUnavailable])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const targetCanvas = canvas
    const host = targetCanvas.closest<HTMLElement>('.sapphire-gem')
    const context = targetCanvas.getContext('webgl', {
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
      powerPreference: 'high-performance',
    })

    if (!context) {
      unavailableRef.current()
      return
    }

    const gl = context
    let program: WebGLProgram | null = null
    let buffer: WebGLBuffer | null = null
    let frameId = 0
    let disposed = false
    let lastFrame = 0
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    try {
      program = createProgram(gl)
      buffer = gl.createBuffer()
      if (!buffer) throw new Error('No se pudo reservar el buffer orbital.')

      const position = attribute(gl, program, 'aPosition')
      const size = attribute(gl, program, 'aSize')
      const color = attribute(gl, program, 'aColor')
      const stride = FLOATS_PER_POINT * Float32Array.BYTES_PER_ELEMENT

      gl.useProgram(program)
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)

      gl.enableVertexAttribArray(position)
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, stride, 0)
      gl.enableVertexAttribArray(size)
      gl.vertexAttribPointer(
        size,
        1,
        gl.FLOAT,
        false,
        stride,
        2 * Float32Array.BYTES_PER_ELEMENT,
      )
      gl.enableVertexAttribArray(color)
      gl.vertexAttribPointer(
        color,
        4,
        gl.FLOAT,
        false,
        stride,
        3 * Float32Array.BYTES_PER_ELEMENT,
      )

      gl.clearColor(0, 0, 0, 0)
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE)
      gl.disable(gl.DEPTH_TEST)

      function render(now: number) {
        if (disposed) return

        const interval = energizedRef.current ? 1000 / 60 : 1000 / 40
        if (!reducedMotion && now - lastFrame < interval) {
          frameId = requestAnimationFrame(render)
          return
        }
        lastFrame = now

        const rect = targetCanvas.getBoundingClientRect()
        const ratio = Math.min(devicePixelRatio || 1, 2)
        const width = Math.max(1, Math.round(rect.width * ratio))
        const height = Math.max(1, Math.round(rect.height * ratio))

        if (targetCanvas.width !== width || targetCanvas.height !== height) {
          targetCanvas.width = width
          targetCanvas.height = height
          gl.viewport(0, 0, width, height)
        }

        const duration = readDuration(host)
        const phase = reducedMotion ? 0 : getSharedOrbitPhase(now, duration)
        const pulse = readPulse(host)
        const vertices = buildOrbitVertices(
          depth,
          phase,
          pulse,
          energizedRef.current,
          ratio,
        )

        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW)
        gl.drawArrays(gl.POINTS, 0, vertices.length / FLOATS_PER_POINT)

        if (!reducedMotion) frameId = requestAnimationFrame(render)
      }

      frameId = requestAnimationFrame(render)
    } catch (error) {
      console.warn('La órbita usará el respaldo CSS.', error)
      unavailableRef.current()
    }

    return () => {
      disposed = true
      cancelAnimationFrame(frameId)
      if (buffer) gl.deleteBuffer(buffer)
      if (program) gl.deleteProgram(program)
    }
  }, [depth])

  return (
    <canvas
      ref={canvasRef}
      className={`sapphire-orbit-webgl sapphire-orbit-webgl-${depth}`}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        zIndex: depth === 'front' ? 3 : 1,
        display: 'block',
        width: '154%',
        height: '46%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  )
}
