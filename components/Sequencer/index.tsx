import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { LFOParameters } from '@/tone/createLFO'
import useLFO from '@/hooks/useLFO'
import LinearKnob from '@/components/LinearKnob'
import { secondaryColor, gray } from '@/app/globals'
import styles from './index.module.css'

const defaultSeqLfo: LFOParameters = {
  frequency: 1,
  dutyCycle: 0.5,
  shape: 0,
}
const NUM_STEPS = 8

interface SequencerProps {
  initialized: boolean
  lfo1Phase?: React.RefObject<null | number>
}

export default function Sequencer({ initialized }: SequencerProps) {
  const [step, setStep] = useState<number>(0)
  const [skip, setSkip] = useState<boolean[]>(() => Array(NUM_STEPS).fill(false))
  const [internalFreq, setInternalFreq] = useState<number>(1)
  const [sequenceIndex, setSequenceIndex] = useState<number>(0)

  const { value: lfo, setFrequency } = useLFO(initialized, defaultSeqLfo)
  const lfoRef = useRef<number>(lfo)

  const skipRef = useRef(skip)
  useEffect(() => {
    skipRef.current = skip
  }, [skip])

  const sequenceStepper = (
    currentStep: number,
    firstStep: number,
    secondStep: number,
    currentPhase: boolean
  ): number => {
    const nextStep = currentPhase
      ? (currentStep + firstStep + NUM_STEPS) % NUM_STEPS
      : (currentStep + secondStep + NUM_STEPS) % NUM_STEPS
    seqPhase.current = !currentPhase
    return nextStep
  }

  // sequences
  const seqPhase = useRef<boolean>(true)
  const sequences = useRef<Record<string, (currentStep: number, currentPhase: boolean) => number>>({
    up: (currentStep: number) => (currentStep + 1) % NUM_STEPS,
    down: (currentStep: number) => (currentStep - 1 + NUM_STEPS) % NUM_STEPS,
    'up/down': (currentStep: number) => {
      if (currentStep === skipRef.current.findIndex((s) => !s)) seqPhase.current = true
      if (currentStep === skipRef.current.findLastIndex((s) => !s)) seqPhase.current = false
      return seqPhase.current ? (currentStep + 1) % NUM_STEPS : (currentStep - 1 + NUM_STEPS) % NUM_STEPS
    },
    random: () => Math.floor(Math.random() * NUM_STEPS),
    '+2-1': (currentStep: number, currentPhase: boolean) => sequenceStepper(currentStep, 2, -1, currentPhase),
    '+1-2': (currentStep: number, currentPhase: boolean) => sequenceStepper(currentStep, 1, -2, currentPhase),
    '-3+5': (currentStep: number, currentPhase: boolean) => sequenceStepper(currentStep, -3, 5, currentPhase),
  })
  useEffect(() => {
    seqPhase.current = true
  }, [sequenceIndex])

  const advanceStep = useCallback(() => {
    if (skip.every((s) => s)) return

    setStep((step) => {
      const sequenceFunc = sequences.current[Object.keys(sequences.current)[sequenceIndex]]
      let nextStep = sequenceFunc(step, seqPhase.current)
      let depth = 0
      while (skip[nextStep] && depth < NUM_STEPS) {
        nextStep = sequenceFunc(nextStep, seqPhase.current)
        depth++
      }

      return nextStep
    })
  }, [skip, sequenceIndex])

  useEffect(() => {
    // advance sequencer at rising edge of internal LFO
    if (lfo === 1 && lfoRef.current === 0) {
      advanceStep()
    }

    lfoRef.current = lfo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lfo])

  useEffect(() => {
    setFrequency?.current?.(internalFreq)
  }, [internalFreq, setFrequency])

  // Helper function to get pin state based on bit position
  // 74HC148 has active-LOW outputs, so invert the bit
  const getPinState = useCallback(
    (bitPosition: number): boolean => {
      return (sequenceIndex & (1 << bitPosition)) === 0
    },
    [sequenceIndex]
  )

  // Helper function to get step pin state based on bit position
  // 74HC238 has active-HIGH outputs
  const getStepPinState = useCallback(
    (bitPosition: number): boolean => {
      return (step & (1 << bitPosition)) !== 0
    },
    [step]
  )

  const content = useMemo(
    () => (
      <div className={styles.sequencer}>
        {/* frequency control */}
        <div className={styles.sequencerControls}>
          <div className={styles.knobControl}>
            <LinearKnob
              min={0.1}
              max={10}
              value={internalFreq}
              onChange={(internalFreq) => {
                setInternalFreq(internalFreq)
              }}
              strokeColor={secondaryColor}
              taper="log"
            />
            <p style={{ color: secondaryColor }}>{internalFreq.toFixed(2)} Hz</p>
          </div>

          <button onClick={advanceStep}>Manual Step</button>
        </div>

        <div className={styles.sequencerControls}>
          {/* sequence selector */}
          <div className={styles.sequenceSelector}>
            <div className={styles.knobControl}>
              <LinearKnob
                min={0}
                max={Object.keys(sequences.current).length - 1}
                step={1}
                value={sequenceIndex}
                onChange={(sequenceIndex) => {
                  setSequenceIndex(sequenceIndex)
                }}
                strokeColor={secondaryColor}
              />
            </div>
            <p>
              sequence:
              <br />
              {Object.keys(sequences.current)[sequenceIndex]}
            </p>
          </div>

          <p>
            pin header 2
            <br />
            INPUT from 74HC148
          </p>

          <div className={styles.pins} style={{ marginTop: -32 }}>
            <div className={styles.pin}>
              <span>PIN 13</span>
              <div className={styles.pinData}>
                <div
                  className={styles.pinGraphic}
                  style={{ backgroundColor: getPinState(0) ? secondaryColor : gray }}></div>
                <span style={{ color: getPinState(0) ? secondaryColor : gray }}>{getPinState(0) ? 'HIGH' : 'LOW'}</span>
              </div>
            </div>

            <div className={styles.pin}>
              <span>PIN 11</span>
              <div className={styles.pinData}>
                <div
                  className={styles.pinGraphic}
                  style={{ backgroundColor: getPinState(1) ? secondaryColor : gray }}></div>
                <span style={{ color: getPinState(1) ? secondaryColor : gray }}>{getPinState(1) ? 'HIGH' : 'LOW'}</span>
              </div>
            </div>

            <div className={styles.pin}>
              <span>PIN 9</span>
              <div className={styles.pinData}>
                <div
                  className={styles.pinGraphic}
                  style={{ backgroundColor: getPinState(2) ? secondaryColor : gray }}></div>
                <span style={{ color: getPinState(2) ? secondaryColor : gray }}>{getPinState(2) ? 'HIGH' : 'LOW'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* main sequencer steps */}
        <div className={styles.sequenceSteps}>
          {Array.from({ length: NUM_STEPS }, (_, i) => (
            <div key={i} className={styles.sequenceStep}>
              <p className={styles.stepNum} style={{ color: step === i ? secondaryColor : gray }}>
                {i + 1}
              </p>

              <svg
                className={styles.skipStep}
                width="20"
                height="20"
                viewBox="0 0 20 20"
                onClick={() => {
                  const newSkip = [...skip]
                  newSkip[i] = !newSkip[i]
                  setSkip(newSkip)
                }}>
                <line x1="0" y1="0" x2="20" y2="20" stroke={skip[i] ? secondaryColor : gray} strokeWidth="2" />
                <line x1="20" y1="0" x2="0" y2="20" stroke={skip[i] ? secondaryColor : gray} strokeWidth="2" />
              </svg>
            </div>
          ))}
        </div>

        <div className={styles.outputPins}>
          <p>
            pin header 2
            <br />
            OUTPUT from 74HC238
          </p>

          <div className={styles.pins}>
            <div className={styles.pin}>
              <span>PIN 7</span>
              <div className={styles.pinData}>
                <div
                  className={styles.pinGraphic}
                  style={{ backgroundColor: getStepPinState(0) ? secondaryColor : gray }}></div>
                <span style={{ color: getStepPinState(0) ? secondaryColor : gray }}>
                  {getStepPinState(0) ? 'HIGH' : 'LOW'}
                </span>
              </div>
            </div>

            <div className={styles.pin}>
              <span>PIN 5</span>
              <div className={styles.pinData}>
                <div
                  className={styles.pinGraphic}
                  style={{ backgroundColor: getStepPinState(1) ? secondaryColor : gray }}></div>
                <span style={{ color: getStepPinState(1) ? secondaryColor : gray }}>
                  {getStepPinState(1) ? 'HIGH' : 'LOW'}
                </span>
              </div>
            </div>

            <div className={styles.pin}>
              <span>PIN 3</span>
              <div className={styles.pinData}>
                <div
                  className={styles.pinGraphic}
                  style={{ backgroundColor: getStepPinState(2) ? secondaryColor : gray }}></div>
                <span style={{ color: getStepPinState(2) ? secondaryColor : gray }}>
                  {getStepPinState(2) ? 'HIGH' : 'LOW'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    [step, skip, internalFreq, sequenceIndex, advanceStep, getPinState, getStepPinState]
  )

  return content
}
