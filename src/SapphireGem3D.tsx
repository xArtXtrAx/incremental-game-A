import { useEffect, useRef, useState } from 'react'

type Props = {
  energized: boolean
  prestigeCount: number
  onUnavailable: () => void
}

type Vec3 = readonly [number, number, number]

type Geometry = {
  vertices: Float32Array
  vertexCount: number
}

const TAU = Math.PI * 2
const STRIDE_FLOATS = 10
const MIN_PULSE_DURATION_SECONDS = 3
const MAX_PULSE_DURATION_SECONDS = 20
const PULSE_ACCELERATION_POWER = 1.6

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value))
}

export function getSapphirePulseDuration(progress: number) {
  const remaining = 1 - clamp01(progress)
  return (
    MIN_PULSE_DURATION_SECONDS +
    (MAX_PULSE_DURATION_SECONDS - MIN_PULSE_DURATION_SECONDS) *
      remaining ** PULSE_ACCELERATION_POWER
  )
}

function readCoreProgress(canvas: HTMLCanvasElement) {
  const core = canvas.closest('.core-column')
  const button = core?.querySelector<HTMLElement>('.click-button')
  const fillValue = button?.style.getPropertyValue('--fill-level') ?? '0'
  const fillPercentage = Number.parseFloat(fillValue)

  return Number.isFinite(fillPercentage) ? clamp01(fillPercentage / 100) : 0
}

function subtract(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
}

function normalize(vector: Vec3): Vec3 {
  const length = Math.hypot(...vector) || 1
  return [vector[0] / length, vector[1] / length, vector[2] / length]
}

function faceNormal(a: Vec3, b: Vec3, c: Vec3): Vec3 {
  const u = subtract(b, a)
  const v = subtract(c, a)
  return normalize([
    u[1] * v[2] - u[2] * v[1],
    u[2] * v[0] - u[0] * v[2],
    u[0] * v[1] - u[1] * v[0],
  ])
}

function buildGeometry(prestigeCount: number): Geometry {
  const facets = Math.min(12, 6 + Math.max(0, prestigeCount - 1) * 2)
  const top: Vec3 = [0, 1.48, 0]
  const bottom: Vec3 = [0, -1.52, 0]
  const upper: Vec3[] = []
  const lower: Vec3[] = []

  for (let index = 0; index < facets; index += 1) {
    const angle = (index / facets) * TAU
    const lowerAngle = angle + Math.PI / facets
    const alternating = index % 2 === 0 ? 1 : 0.9
    upper.push([
      Math.cos(angle) * 0.86 * alternating,
      0.48,
      Math.sin(angle) * 0.86 * alternating,
    ])
    lower.push([
      Math.cos(lowerAngle) * 0.7,
      -0.42,
      Math.sin(lowerAngle) * 0.7,
    ])
  }

  const triangles: Array<readonly [Vec3, Vec3, Vec3]> = []
  for (let index = 0; index < facets; index += 1) {
    const next = (index + 1) % facets
    triangles.push([top, upper[index], upper[next]])
    triangles.push([upper[index], lower[index], upper[next]])
    triangles.push([upper[next], lower[index], lower[next]])
    triangles.push([bottom, lower[next], lower[index]])
  }

  const values: number[] = []
  triangles.forEach((triangle, triangleIndex) => {
    const normal = faceNormal(...triangle)
    const shimmer = (Math.sin(triangleIndex * 1.91) + 1) * 0.5
    const upward = Math.max(0, normal[1])
    const color: Vec3 = [
      0.02 + shimmer * 0.04,
      0.2 + upward * 0.2 + shimmer * 0.1,
      0.62 + upward * 0.22 + shimmer * 0.16,
    ]
    const delay = (triangleIndex / Math.max(1, triangles.length - 1)) * 0.68

    for (const vertex of triangle) {
      values.push(...vertex, ...normal, ...color, delay)
    }
  })

  return {
    vertices: new Float32Array(values),
    vertexCount: values.length / STRIDE_FLOATS,
  }
}

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) throw new Error('No se pudo crear el shader.')
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) ?? 'Shader inválido.'
    gl.deleteShader(shader)
    throw new Error(message)
  }
  return shader
}

function createProgram(gl: WebGLRenderingContext) {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, `
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    attribute vec3 aColor;
    attribute float aDelay;
    uniform float uSpin;
    uniform float uTilt;
    uniform float uAspect;
    uniform float uAssembly;
    uniform float uEnergy;
    uniform float uTime;
    varying vec3 vNormal;
    varying vec3 vColor;
    varying vec3 vPosition;

    vec3 rotateY(vec3 p, float a) {
      float c = cos(a), s = sin(a);
      return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
    }
    vec3 rotateX(vec3 p, float a) {
      float c = cos(a), s = sin(a);
      return vec3(p.x, c * p.y - s * p.z, s * p.y + c * p.z);
    }

    void main() {
      float reveal = smoothstep(aDelay, min(1.0, aDelay + 0.28), uAssembly);
      vec3 local = aPosition * reveal;
      local += aNormal * sin(uTime * 3.2 + aDelay * 18.0) * 0.018 * uEnergy;
      vec3 position = rotateX(rotateY(local, uSpin), uTilt);
      vec3 normal = normalize(rotateX(rotateY(aNormal, uSpin), uTilt));
      position.y += sin(uTime * 1.7) * 0.035;
      position.z -= 4.15;

      float nearPlane = 0.1, farPlane = 20.0, focal = 2.75;
      float projectionA = (farPlane + nearPlane) / (nearPlane - farPlane);
      float projectionB = (2.0 * farPlane * nearPlane) / (nearPlane - farPlane);
      gl_Position = vec4(
        position.x * focal / uAspect,
        position.y * focal,
        projectionA * position.z + projectionB,
        -position.z
      );
      vNormal = normal;
      vColor = aColor;
      vPosition = position;
    }
  `)

  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, `
    precision highp float;
    uniform float uEnergy;
    uniform float uPulse;
    varying vec3 vNormal;
    varying vec3 vColor;
    varying vec3 vPosition;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDirection = normalize(-vPosition);
      vec3 keyLight = normalize(vec3(-0.55, 0.85, 0.72));
      vec3 rimLight = normalize(vec3(0.82, -0.18, 0.56));
      float diffuse = max(dot(normal, keyLight), 0.0);
      float secondary = max(dot(normal, rimLight), 0.0);
      float fresnel = pow(1.0 - max(dot(normal, viewDirection), 0.0), 2.25);
      float visibility = clamp(uPulse, 0.1, 1.0);
      float bodyLight = 0.08 + visibility * 0.92;
      float edgeLight = 0.14 + visibility * 0.86;

      vec3 color = vColor * (0.42 + diffuse * 1.05 + secondary * 0.32) * bodyLight;
      color += vec3(0.25, 0.86, 1.0) *
        (fresnel * 0.82 * edgeLight + uEnergy * (0.35 + visibility * 0.32));
      color += vec3(0.86, 1.0, 1.0) * pow(diffuse, 5.0) * 0.5 * bodyLight;

      float alpha = clamp(
        0.04 + visibility * 0.82 + fresnel * 0.12 + uEnergy * 0.08,
        0.08,
        1.0
      );
      gl_FragColor = vec4(color, alpha);
    }
  `)

  const program = gl.createProgram()
  if (!program) throw new Error('No se pudo crear el programa WebGL.')
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  gl.deleteShader(vertexShader)
  gl.deleteShader(fragmentShader)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) ?? 'Programa WebGL inválido.'
    gl.deleteProgram(program)
    throw new Error(message)
  }
  return program
}

function attribute(gl: WebGLRenderingContext, program: WebGLProgram, name: string) {
  const location = gl.getAttribLocation(program, name)
  if (location < 0) throw new Error(`Atributo no encontrado: ${name}`)
  return location
}

function uniform(gl: WebGLRenderingContext, program: WebGLProgram, name: string) {
  const location = gl.getUniformLocation(program, name)
  if (!location) throw new Error(`Uniforme no encontrado: ${name}`)
  return location
}

export function SapphireGem3D({
  energized,
  prestigeCount,
  onUnavailable,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const energizedRef = useRef(energized)
  const unavailableRef = useRef(onUnavailable)
  const [ready, setReady] = useState(false)

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
    const host = targetCanvas.parentElement
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
    const geometry = buildGeometry(Math.max(1, prestigeCount))
    let program: WebGLProgram | null = null
    let buffer: WebGLBuffer | null = null
    let frameId = 0
    let disposed = false
    let lastFrame = 0
    let previousPulseTime = performance.now()
    let pulsePhase = 0
    let displayedPulse = 1
    const startedAt = performance.now()
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    try {
      program = createProgram(gl)
      buffer = gl.createBuffer()
      if (!buffer) throw new Error('No se pudo reservar el buffer WebGL.')
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(gl.ARRAY_BUFFER, geometry.vertices, gl.STATIC_DRAW)

      const position = attribute(gl, program, 'aPosition')
      const normal = attribute(gl, program, 'aNormal')
      const color = attribute(gl, program, 'aColor')
      const delay = attribute(gl, program, 'aDelay')
      const spin = uniform(gl, program, 'uSpin')
      const tilt = uniform(gl, program, 'uTilt')
      const aspect = uniform(gl, program, 'uAspect')
      const assembly = uniform(gl, program, 'uAssembly')
      const energy = uniform(gl, program, 'uEnergy')
      const pulse = uniform(gl, program, 'uPulse')
      const time = uniform(gl, program, 'uTime')
      const stride = STRIDE_FLOATS * Float32Array.BYTES_PER_ELEMENT

      gl.useProgram(program)
      for (const [location, size, offset] of [
        [position, 3, 0],
        [normal, 3, 3],
        [color, 3, 6],
        [delay, 1, 9],
      ] as const) {
        gl.enableVertexAttribArray(location)
        gl.vertexAttribPointer(
          location,
          size,
          gl.FLOAT,
          false,
          stride,
          offset * Float32Array.BYTES_PER_ELEMENT,
        )
      }

      gl.clearColor(0, 0, 0, 0)
      gl.enable(gl.DEPTH_TEST)
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
      gl.disable(gl.CULL_FACE)
      setReady(true)

      function render(now: number) {
        if (disposed) return
        if (document.hidden) {
          previousPulseTime = now
          frameId = requestAnimationFrame(render)
          return
        }

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

        const elapsed = (now - startedAt) / 1000
        const deltaSeconds = Math.min(0.1, Math.max(0, (now - previousPulseTime) / 1000))
        previousPulseTime = now
        const active = energizedRef.current ? 1 : 0
        const progress = readCoreProgress(targetCanvas)
        const pulseDuration = getSapphirePulseDuration(progress)
        pulsePhase = (pulsePhase + deltaSeconds / pulseDuration) % 1
        const naturalPulse = 0.55 + 0.45 * Math.cos(TAU * pulsePhase)
        const pulseTarget = active > 0 ? 1 : naturalPulse
        const smoothing = Math.min(1, deltaSeconds * 4)
        displayedPulse += (pulseTarget - displayedPulse) * smoothing

        host?.style.setProperty('--sapphire-pulse', displayedPulse.toFixed(4))
        host?.style.setProperty(
          '--sapphire-pulse-duration',
          `${pulseDuration.toFixed(3)}s`,
        )

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        gl.uniform1f(spin, reducedMotion ? 0.58 : elapsed * (active ? 1.45 : 0.72))
        gl.uniform1f(tilt, -0.18 + Math.sin(elapsed * 0.54) * 0.11)
        gl.uniform1f(aspect, width / height)
        gl.uniform1f(assembly, reducedMotion ? 1 : Math.min(1, elapsed / 1.08))
        gl.uniform1f(energy, active)
        gl.uniform1f(pulse, reducedMotion ? 1 : displayedPulse)
        gl.uniform1f(time, elapsed)
        gl.drawArrays(gl.TRIANGLES, 0, geometry.vertexCount)
        if (!reducedMotion) frameId = requestAnimationFrame(render)
      }

      frameId = requestAnimationFrame(render)
    } catch (error) {
      console.warn('El zafiro usará el respaldo SVG.', error)
      unavailableRef.current()
    }

    return () => {
      disposed = true
      cancelAnimationFrame(frameId)
      host?.style.removeProperty('--sapphire-pulse')
      host?.style.removeProperty('--sapphire-pulse-duration')
      if (buffer) gl.deleteBuffer(buffer)
      if (program) gl.deleteProgram(program)
    }
  }, [prestigeCount])

  return (
    <canvas
      ref={canvasRef}
      className={`sapphire-gem-canvas${ready ? ' is-ready' : ''}`}
      style={{
        position: 'relative',
        zIndex: 2,
        display: 'block',
        width: '100%',
        height: '100%',
        opacity: ready ? 1 : 0,
        transition: 'opacity 240ms ease',
      }}
      aria-hidden="true"
    />
  )
}
