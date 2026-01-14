import styles from './index.module.css'

export default function Explanation() {
  return (
    <div className={styles.explanation}>
      <h3>ABOUT</h3>

      <span>
        The last thing we are building is a musical sequencer. A sequencer is a device that plays a sequence of steps.
        Our sequencer has 8 steps, and it can play various different types of sequences (sequence logic). You will
        receive a gate pulse in, and on each pulse the sequencer will advance to the next step in the sequence. You will
        output the current sequence step number by controlling the data pins of a 74HC238 3-to-8 line decoder.
      </span>

      <h3>CONTROLS</h3>

      <span>
        In order to determine which type of <b>sequence</b> to play, I have an 8-position switch hooked up to a 74HC148
        8-to-3 line encoder, so you will read the data pins of the 74HC148 to determine which sequence logic to use. For
        now I only have 7 sequence logics to implement (which I will explain below), but we will add one more later.
      </span>

      <span>
        The <b>Manual Step</b> button allows you to manually advance the sequencer one step at a time.
      </span>

      <span>
        Beneath each step number there is a small <b>X</b> button that allows you to skip that step when the sequencer
        is playing. If the sequencer would land on that step, it will instead advance to the next step after that in the
        chosen sequence.
      </span>

      <h3>IMPLEMENTATION</h3>

      <span>The sequencer uses all of Pin Header 2.</span>

      <span>
        You will receive your gate input at PH2 pin 1. Please note that even though this web demo uses an internal
        oscillator to clock the sequencer, we will actually only have the gate input for advancing the sequencer on the
        real thing.
      </span>

      <span>
        The rotary switch and 74HC148 are on my analog board, but you will have 3 digital inputs to receive the data
        pins of the 74HC148 on PH2 pins 13, 11, and 9. Pin 13 is the LSB (A0), and pin 9 is the MSB (A2). Remember that
        the 74HC148 has active LOW logic levels!
      </span>

      <span>
        Most of the hardware for the sequencer is on my analog board, but you control which step is currently active
        with 3 digital outputs that set the data pins of a 74HC238 3-to-8 line decoder. You will set the data pins on
        PH2 pins 7, 5, and 3. Pin 7 is the LSB (A0), and pin 3 is the MSB (A2). Unlike the 74HC148, the 74HC238 uses
        active HIGH logic levels! Sorry for the confusion 😊
      </span>

      <span>
        We have one digital input for the <b>Manual Step</b> button at PH2 pin 15. It uses active HIGH logic. I have a
        hardware debounce resistor on all buttons/switches, but we should probably do some software debouncing on them
        as well?
      </span>

      <span>
        We have 8 digital inputs for each of the skip buttons (the <b>X</b> buttons in this demo which allow you to skip
        sequence steps). The first skip button (for step 1) is at PH2 pin 16. The step 2 skip button is at pin 14, step
        3 is at pin 12, step 4 is at pin 10, step 5 is at pin 8, step 6 is at pin 6, step 7 is at pin 4, and step 8 is
        at pin 2. All skip buttons use active HIGH logic.
      </span>

      <h4>Sequence Types</h4>

      <ul>
        <li>
          1. <b>up</b> - on each clock pulse, simply go up to the next step in the sequence (or wrap back around to the
          first step of course).
        </li>
        <li>
          2. <b>down</b> - go down to the previous step in the sequence (or wrap back around to the last step).
        </li>
        <li>
          3. <b>up/down</b> - go up to the next step until the end, then go down to the previous step until the
          beginning, then repeat. When I implemented this one, I have to keep track of which phase of the sequence we
          are in, going forward, or going backward.
        </li>
        <li>
          4. <b>random</b> - pick a random step in the sequence on each gate input.
        </li>
        <li>
          5. <b>+2-1</b> - for this sequence type, you switch between going forward 2 steps and going backward 1 step,
          wrapping as necessary. So, on one gate pulse you will advance 2 steps, and on the next gate pulse you will go
          back 1 step. When I implemented this one, I have to keep track of which phase of the sequence we are in, going
          forward, or going backward.
        </li>
        <li>
          6. <b>+1-2</b> - this is similar to the previous sequence type, but instead you switch between going forward 1
          step and going backward 2 steps.
        </li>
        <li>
          7. <b>-3+5</b> - this is similar to the previous sequence type, but instead you switch between going backward
          3 steps and going forward 5 steps.
        </li>
        <li>8. Not implemented yet! I&apos;ll decide what type of sequence we should have here later.</li>
      </ul>

      <h3>GITHUB</h3>

      <a target="_blank" href="https://github.com/bmandeberg/l-amb-seq">
        https://github.com/bmandeberg/l-amb-seq
      </a>

      <span>
        This example website is a NextJS project, and the main code to check would be the Sequencer component.{' '}
        <a target="_blank" href="https://github.com/bmandeberg/l-amb-seq/blob/main/components/Sequencer/index.tsx">
          /components/Sequencer/index.tsx
        </a>
        <br />
        My javascript implementation of the sequence logic is in there, so you can use that as a reference.
      </span>
    </div>
  )
}
