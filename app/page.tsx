'use client'

import { useState, useCallback, useEffect, CSSProperties as CSS } from 'react'
import * as Tone from 'tone'
import Sequencer from '@/components/Sequencer'
import Explanation from '@/components/Explanation'
import { secondaryColor, gray } from './globals'
import getNativeContext from '@/util/getNativeContext'
import styles from './page.module.css'

export default function LAMBSeq() {
  const [initialized, setInitialized] = useState(false)
  const [playing, setPlaying] = useState(false)

  const playStop = useCallback(async () => {
    if (!initialized) {
      await Tone.start()
      setInitialized(true)
    }

    setPlaying((playing) => {
      const ctx = getNativeContext()
      if (!playing) {
        ctx.resume()
      } else {
        ctx.suspend()
      }

      return !playing
    })
  }, [initialized])

  // play/stop on spacebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault() // prevent scrolling
        playStop()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [playStop])

  return (
    <div className={styles.page} style={{ '--secondary-color': secondaryColor, '--gray': gray } as CSS}>
      <Sequencer initialized={initialized} playing={playing} playStop={playStop} />

      <Explanation />
    </div>
  )
}
