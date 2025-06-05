"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Lenis from "lenis"

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export default function SmoothScroll(props) {
  const {
    children,
    duration = 1.2,
    easing = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation = "vertical",
    gestureOrientation = "vertical",
    smoothTouch = false,
    wheelMultiplier = 1,
    touchMultiplier = 2,
    infinite = false,
    autoResize = true,
    __experimental__naiveDimensions = false,
  } = props

  const lenisRef = useRef(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    const lenis = new Lenis({
      duration,
      easing,
      orientation,
      gestureOrientation,
      smoothTouch,
      wheelMultiplier,
      touchMultiplier,
      infinite,
      autoResize,
      __experimental__naiveDimensions,
    })

    lenisRef.current = lenis

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    const rafId = requestAnimationFrame(raf)

    lenis.on("scroll", () => {
      ScrollTrigger.update()
    })

    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value) {
        if (arguments.length) {
          lenis.scrollTo(value, { immediate: true })
        }
        return lenis.animatedScroll
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        }
      },
      pinType: document.body.style.transform ? "transform" : "fixed",
    })

    const onRefresh = () => lenis.resize()
    ScrollTrigger.addEventListener("refresh", onRefresh)
    ScrollTrigger.refresh()

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
      ScrollTrigger.removeEventListener("refresh", onRefresh)
      ScrollTrigger.killAll()
      lenisRef.current = null
    }
  }, [
    duration,
    easing,
    orientation,
    gestureOrientation,
    smoothTouch,
    wheelMultiplier,
    touchMultiplier,
    infinite,
    autoResize,
    __experimental__naiveDimensions,
  ])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lenisRef.current) return

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault()
          lenisRef.current.scrollTo(lenisRef.current.animatedScroll - 100)
          break
        case "ArrowDown":
          e.preventDefault()
          lenisRef.current.scrollTo(lenisRef.current.animatedScroll + 100)
          break
        case "Home":
          e.preventDefault()
          lenisRef.current.scrollTo(0)
          break
        case "End":
          e.preventDefault()
          lenisRef.current.scrollTo(document.body.scrollHeight)
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return <>{children}</>
}

// Hook to access Lenis instance
export function useLenis() {
  const lenis = useRef(null)

  useEffect(() => {
    const checkLenis = () => {
      if (window.lenis) {
        lenis.current = window.lenis
      }
    }

    checkLenis()
    const interval = setInterval(checkLenis, 100)

    return () => clearInterval(interval)
  }, [])

  return lenis.current
}

// ScrollTo utility
export function ScrollTo(props) {
  const {
    to,
    offset = 0,
    duration,
    easing,
    immediate = false,
    lock = false,
    force = false,
    onComplete,
    children,
  } = props

  const lenis = useLenis()

  const scrollTo = () => {
    if (!lenis) return

    lenis.scrollTo(to, {
      offset,
      duration,
      easing,
      immediate,
      lock,
      force,
      onComplete,
    })
  }

  return <>{children(scrollTo)}</>
}
