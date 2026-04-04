export const BEAT_PATTERNS = [
  {
    name: 'Basic rock beat',
    desc: 'Kick on beats 1 and 3, snare on 2 and 4, hi-hat on every 8th note. The foundation of rock, pop, and almost everything else.',
    rows: [
      { name: 'Kick',   steps: [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0] },
      { name: 'Snare',  steps: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0] },
      { name: 'Hi-Hat', steps: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0] },
    ],
  },
  {
    name: 'Four-on-the-floor',
    desc: 'Kick on every beat, open hi-hat on the offbeats. The backbone of house, techno, and dance music.',
    rows: [
      { name: 'Kick',   steps: [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0] },
      { name: 'Snare',  steps: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0] },
      { name: 'Hi-Hat', steps: [0,1,0,1, 0,1,0,1, 0,1,0,1, 0,1,0,1] },
    ],
  },
  {
    name: 'Syncopated kick',
    desc: 'Kick displaced off the beat adds forward motion and groove. Snare still holds down 2 and 4 as the anchor.',
    rows: [
      { name: 'Kick',   steps: [1,0,0,1, 0,0,1,0, 1,0,0,0, 0,1,0,0] },
      { name: 'Snare',  steps: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0] },
      { name: 'Hi-Hat', steps: [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1] },
    ],
  },
]

export const BEAT_TIPS = [
  { num: '1', text: 'The <strong>backbeat</strong> is everything. Snare on beats 2 and 4 is what makes music groove rather than march. Lock that in first.' },
  { num: '2', text: '<strong>Beats 1, 5, 9, 13</strong> in the drum computer are the four quarter-note beats of one bar. Kick and snare live here.' },
  { num: '3', text: '<strong>Hi-hats subdivide time.</strong> 8th notes (every other step) feel steady. 16th notes (every step) feel urgent. Offbeat 8ths feel bouncy.' },
  { num: '4', text: '<strong>Leave space.</strong> A kick on every 16th step is noise, not a beat. What you don\'t play shapes the groove as much as what you do.' },
]
