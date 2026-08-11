/*
  Creative work lives in three lanes:
    media   — video (and photos, if you add them later)
    writing — the academic blogs (CS 373 / CS 371P), which have their own routes
    notes   — shorter, non-academic thinking

  To add a video: drop the file in /assets/videos/creative/, then fill in `src`
  below. Entries with no `src` render as a labelled empty frame, so the grid
  keeps its shape while you fill it in.
*/

export type MediaItem = {
  id: string;
  title: string;
  context: string;
  kind: 'photo' | 'video';
  /** Root-relative, e.g. '/assets/videos/creative/tunnel-walk.mp4' */
  src?: string;
  /** Still frame shown before playback. Without it the browser uses frame one. */
  poster?: string;
  /** Optional link out to the finished piece. */
  href?: string;
  /** Sizes the frame before the file loads, so the grid doesn't jump. */
  ratio?: '16/9' | '4/5' | '9/16' | '3/2' | '2/3' | '1/1';
};

export const media: MediaItem[] = [
  {
    id: 'summer-all-sport',
    title: '2026-2027 All-Sport Highlight',
    context: 'Texas Athletics — Creative Media',
    kind: 'video',
    ratio: '16/9',
    src: '/assets/videos/creative/summer-all-sport.mp4',
    poster: '/assets/videos/creative/summer-all-sport.jpg',
  },
  {
    id: 'big-ticket-2026',
    title: '2026-2027 Big Ticket',
    context: 'Texas Athletics — Creative Media',
    kind: 'video',
    ratio: '16/9',
    src: '/assets/videos/creative/big-ticket-2026.mp4',
    poster: '/assets/videos/creative/big-ticket-2026.jpg',
  },
  {
    id: 'march-madness',
    title: '2026 March Madness',
    context: 'Texas Athletics — Creative Media',
    kind: 'video',
    ratio: '4/5',
    src: '/assets/videos/creative/march-madness.mp4',
    poster: '/assets/videos/creative/march-madness.jpg',
  },
  {
    id: 'womens-golf-sec',
    title: "Women's Golf, SEC",
    context: 'Texas Athletics — Creative Media',
    kind: 'video',
    ratio: '9/16',
    src: '/assets/videos/creative/womens-golf-sec.mp4',
    poster: '/assets/videos/creative/womens-golf-sec.jpg',
  },
  {
    id: 'big-ticket-2025',
    title: '2025-2026 Big Ticket',
    context: 'Texas Athletics — Creative Media',
    kind: 'video',
    ratio: '16/9',
    src: '/assets/videos/creative/big-ticket-2025.mp4',
    poster: '/assets/videos/creative/big-ticket-2025.jpg',
  },
];

export type Note = {
  id: string;
  title: string;
  date: string;
  /* One-line standfirst shown in the list. */
  summary: string;
  /* Body paragraphs. Plain strings — no markup needed. */
  body: string[];
  draft?: boolean;
};

/*
  These three are placeholders with real titles and no invented opinions —
  replace the body copy with your own and drop `draft: true` to publish.
*/
export const notes: Note[] = [
  {
    id: 'measuring-what-you-optimize',
    title: 'Measuring what you optimize',
    date: 'Draft',
    summary: 'On why the energy number never shows up in the benchmark table.',
    body: [
      'Placeholder. Accuracy and latency get reported by default; joules almost never do. Write down what you found when you actually instrumented it.',
    ],
    draft: true,
  },
  {
    id: 'framing-a-shot-framing-a-system',
    title: 'Framing a shot, framing a system',
    date: 'Draft',
    summary: 'What shooting sideline video taught me about deciding where to cut.',
    body: [
      'Placeholder. Both jobs are mostly about what you leave out. Fill this in with the specific moment that made the connection obvious.',
    ],
    draft: true,
  },
  {
    id: 'the-part-of-the-job-that-isnt-code',
    title: "The part of the job that isn't code",
    date: 'Draft',
    summary: 'Pipelines, tooling, and the unglamorous surface area around a change.',
    body: [
      'Placeholder. You already wrote a version of this in the Collatz post — say it here in your own voice, without the assignment attached.',
    ],
    draft: true,
  },
];
