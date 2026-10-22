"use client"

import { createContext, useContext, useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from "react"
import Image from "next/image"
import styles from "./water-scene.module.css"

const SCENE = "/images/auth/consultorio.webp"
// Fraction of the photo height where the water starts (measured on the cropped source image).
const SHORELINE = 0.65
const WaterMotionContext = createContext(false)

const VERTEX = `
  attribute vec2 position;
  varying vec2 uv;
  void main() {
    uv = vec2((position.x + 1.0) * 0.5, (1.0 - position.y) * 0.5);
    gl_Position = vec4(position, 0.0, 1.0);
  }
`

const FRAGMENT = `
  #ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
  #else
  precision mediump float;
  #endif
  varying vec2 uv;
  uniform sampler2D scene;
  uniform vec2 resolution;
  uniform float imageAspect;
  uniform float shoreline;
  uniform float time;
  uniform vec2 pointer;
  uniform float energy;

  void main() {
    float aspect = resolution.x / resolution.y;
    vec2 cover = aspect > imageAspect
      ? vec2(1.0, imageAspect / aspect)
      : vec2(aspect / imageAspect, 1.0);
    vec2 p = (uv - 0.5) * cover + 0.5;

    // Anchor the water to the source image, including after cover cropping.
    float depth = clamp((p.y - shoreline) / (1.0 - shoreline), 0.0, 1.0);
    float water = smoothstep(0.0, 0.035, depth);

    // Perspective-correct water plane: y is large at the far shore and small near the camera,
    // so ripples are tight and faint in the distance and broad and strong up close.
    float y = 1.0 / (depth * 1.1 + 0.045);
    vec2 w = vec2((p.x - 0.5) * imageAspect * y, y);

    // Three crossing swells; slope (gradient) of the height field tilts the reflection.
    // Fine swells fade out toward the far shore where they would alias into shimmer.
    float f1 = 1.0 - smoothstep(7.0, 12.5, y);
    float f2 = 1.0 - smoothstep(4.5, 8.5, y);
    float f3 = 1.0 - smoothstep(2.8, 5.6, y);
    float a1 = w.x * 6.5 + w.y * 4.2 - time * 0.5;
    float a2 = w.x * 13.0 - w.y * 9.0 - time * 0.72 + sin(a1) * 1.6;
    float a3 = w.x * 24.0 + w.y * 17.0 - time * 1.0 + sin(a2) * 1.1;
    float h = sin(a1) * 0.5 * f1 + sin(a2) * 0.3 * f2 + sin(a3) * 0.2 * f3;
    vec2 slope = vec2(
      cos(a1) * 3.25 * f1 + cos(a2) * 3.9 * f2 + cos(a3) * 4.8 * f3,
      cos(a1) * 2.1 * f1 - cos(a2) * 2.7 * f2 + cos(a3) * 3.4 * f3
    );

    float amp = 1.0 / (1.0 + y * 0.22);
    vec2 displacement = vec2(slope.x * 0.0029, slope.y * 0.0022) * amp * water;

    // Rings that follow the cursor, squashed vertically to read as a flat water plane.
    vec2 pp = (pointer - 0.5) * cover + 0.5;
    vec2 d = (p - pp) * vec2(imageAspect, imageAspect * 2.6);
    float r = length(d);
    float ring = sin(r * 120.0 - time * 7.0) * exp(-r * 5.5) * energy;
    displacement += vec2(d.x / max(r, 0.001) * 0.004, ring * 0.007) * ring * 1.6 * water;
    displacement.y += ring * 0.005 * water;

    vec3 color = texture2D(scene, clamp(p + displacement, 0.001, 0.999)).rgb;

    // Soft depth: the near water is slightly deeper and cooler than the far water.
    color = mix(color, color * vec3(0.8, 0.92, 0.97), smoothstep(0.1, 1.0, depth) * 0.55 * water);

    // Light catching the crests.
    color += vec3(0.8, 0.9, 0.95) * h * 0.028 * amp * water;

    // Warm glints that only sparkle where the lamps and the sunset are reflected.
    float luma = dot(color, vec3(0.299, 0.587, 0.114));
    float spark = pow(clamp(sin(a3 * 1.7 + a2) * 0.5 + 0.5, 0.0, 1.0), 14.0) * (0.35 + 0.65 * f2);
    color += vec3(1.0, 0.8, 0.58) * spark * smoothstep(0.28, 0.7, luma) * water * (0.18 + 0.3 * amp);

    gl_FragColor = vec4(color, 1.0);
  }
`

function subscribeMotion(callback: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)")
  media.addEventListener("change", callback)
  return () => media.removeEventListener("change", callback)
}

function getReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export function WaterScene({ children }: { children: ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [failed, setFailed] = useState(false)
  const reducedMotion = useSyncExternalStore(subscribeMotion, getReducedMotion, () => true)
  const active = !reducedMotion && !failed

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !active) return

    let disposed = false
    let frame = 0
    let release: (() => void) | undefined
    const image = new window.Image()
    const pointer = { x: 0.5, y: 0.8, energy: 0 }

    function fail(message: string) {
      console.warn(`[Auth scene] ${message}. Using the static image.`)
      setFailed(true)
    }

    function onContextLost(event: Event) {
      event.preventDefault()
      cancelAnimationFrame(frame)
      fail("WebGL context lost")
    }

    function onPointerMove(event: PointerEvent) {
      pointer.x = event.clientX / window.innerWidth
      pointer.y = event.clientY / window.innerHeight
      pointer.energy = Math.min(1, pointer.energy + 0.18)
    }

    image.onload = () => {
      if (disposed) return
      const gl = canvas.getContext("webgl", { alpha: false, antialias: false, depth: false, powerPreference: "low-power" })
      if (!gl) {
        fail("WebGL is unavailable")
        return
      }

      const shaders: WebGLShader[] = []
      const program = gl.createProgram()
      const buffer = gl.createBuffer()
      const texture = gl.createTexture()
      release = () => {
        shaders.forEach((shader) => gl.deleteShader(shader))
        gl.deleteTexture(texture)
        gl.deleteBuffer(buffer)
        gl.deleteProgram(program)
      }

      function compile(type: number, source: string) {
        const shader = gl!.createShader(type)
        if (!shader) throw new Error("Unable to allocate water shader")
        shaders.push(shader)
        gl!.shaderSource(shader, source)
        gl!.compileShader(shader)
        if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
          throw new Error(gl!.getShaderInfoLog(shader) || "Unable to compile water shader")
        }
        return shader
      }

      try {
        if (!program || !buffer || !texture) throw new Error("Unable to allocate water renderer")
        gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX))
        gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT))
        gl.linkProgram(program)
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
          throw new Error(gl.getProgramInfoLog(program) || "Unable to link water shader")
        }
        gl.useProgram(program)
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW)
        const position = gl.getAttribLocation(program, "position")
        gl.enableVertexAttribArray(position)
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image)
        gl.uniform1i(gl.getUniformLocation(program, "scene"), 0)
        gl.uniform1f(gl.getUniformLocation(program, "imageAspect"), image.width / image.height)
        gl.uniform1f(gl.getUniformLocation(program, "shoreline"), SHORELINE)
      } catch (error) {
        fail(error instanceof Error ? error.message : "Water renderer initialization failed")
        return
      }

      const resolution = gl.getUniformLocation(program, "resolution")
      const time = gl.getUniformLocation(program, "time")
      const pointerUniform = gl.getUniformLocation(program, "pointer")
      const energyUniform = gl.getUniformLocation(program, "energy")
      let lastFrame = -Infinity
      const start = performance.now()

      function render(now: number) {
        if (disposed) return
        frame = requestAnimationFrame(render)
        if (now - lastFrame < 1000 / 30) return
        lastFrame = now
        const ratio = Math.min(window.devicePixelRatio || 1, 1.5, 1920 / canvas!.clientWidth)
        const width = Math.max(1, Math.round(canvas!.clientWidth * ratio))
        const height = Math.max(1, Math.round(canvas!.clientHeight * ratio))
        if (canvas!.width !== width || canvas!.height !== height) {
          canvas!.width = width
          canvas!.height = height
          gl!.viewport(0, 0, width, height)
        }
        pointer.energy *= 0.94
        gl!.uniform2f(resolution, width, height)
        gl!.uniform1f(time, (now - start) / 1000)
        gl!.uniform2f(pointerUniform, pointer.x, pointer.y)
        gl!.uniform1f(energyUniform, pointer.energy)
        gl!.drawArrays(gl!.TRIANGLES, 0, 6)
        canvas!.dataset.ready = "true"
      }

      function onVisibilityChange() {
        cancelAnimationFrame(frame)
        if (!document.hidden) frame = requestAnimationFrame(render)
      }

      document.addEventListener("visibilitychange", onVisibilityChange)
      window.addEventListener("pointermove", onPointerMove, { passive: true })
      const releaseResources = release
      release = () => {
        document.removeEventListener("visibilitychange", onVisibilityChange)
        window.removeEventListener("pointermove", onPointerMove)
        releaseResources()
      }
      if (!document.hidden) frame = requestAnimationFrame(render)
    }

    image.onerror = () => fail("Water texture could not be loaded")
    canvas.addEventListener("webglcontextlost", onContextLost)
    image.src = SCENE

    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      image.onload = null
      image.onerror = null
      canvas.removeEventListener("webglcontextlost", onContextLost)
      delete canvas.dataset.ready
      release?.()
    }
  }, [active])

  return (
    <WaterMotionContext.Provider value={active}>
      <div className={styles.scene} aria-hidden="true">
        <Image src={SCENE} alt="" fill priority sizes="100vw" unoptimized className={styles.image} />
        <canvas ref={canvasRef} className={styles.canvas} />
      </div>
      {children}
    </WaterMotionContext.Provider>
  )
}

export function WaterReflection({ children, className }: { children: ReactNode; className: string }) {
  const sourceRef = useRef<HTMLDivElement>(null)
  const reflectionRef = useRef<HTMLDivElement>(null)
  const moving = useContext(WaterMotionContext)
  const filterId = `water-reflection-${useId().replace(/:/g, "")}`

  useEffect(() => {
    const source = sourceRef.current
    const target = reflectionRef.current
    if (!source || !target) return
    let frame = 0

    function mirror() {
      const card = source?.firstElementChild?.cloneNode(true)
      if (!(card instanceof HTMLElement) || !target) return
      // Mirror presentation only: never retain entered data, form actions or IDs.
      card.querySelectorAll("input").forEach((input) => {
        if (input.type === "hidden") {
          input.remove()
        } else {
          input.value = ""
          input.removeAttribute("value")
          input.removeAttribute("placeholder")
        }
      })
      card.querySelectorAll("*").forEach((element) => {
        for (const attribute of ["id", "name", "for", "action", "formaction", "href", "aria-describedby", "aria-labelledby"]) {
          element.removeAttribute(attribute)
        }
      })
      card.style.animation = "none"
      target.replaceChildren(card)
    }

    function scheduleMirror() {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(mirror)
    }

    mirror()
    const observer = new MutationObserver(scheduleMirror)
    observer.observe(source, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["class", "aria-hidden", "aria-current", "aria-pressed"],
    })
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
      target.replaceChildren()
    }
  }, [])

  return (
    <div className={className}>
      <div ref={sourceRef}>{children}</div>
      <div className={styles.reflection} aria-hidden="true" inert>
        <svg className={styles.filterDefinition} width="0" height="0">
          <defs>
            <filter id={filterId} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
              <feTurbulence type="fractalNoise" baseFrequency="0.012 0.15" numOctaves="1" seed="8" result="waves">
                {moving ? <animate attributeName="baseFrequency" values="0.012 0.15;0.016 0.19;0.012 0.15" dur="6s" repeatCount="indefinite" /> : null}
              </feTurbulence>
              <feDisplacementMap in="SourceGraphic" in2="waves" scale="13" xChannelSelector="R" yChannelSelector="G" />
              <feGaussianBlur stdDeviation="0.3 0.5" />
            </filter>
          </defs>
        </svg>
        <div style={{ filter: `url(#${filterId})` }}>
          <div ref={reflectionRef} className={styles.mirror} />
        </div>
      </div>
    </div>
  )
}
