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
    id: 'figuring-it-out',
    title: 'We\'ve got work to do.',
    date: '08-10-2026',
    summary: 'I\'m figuring it out, follow along.',
    body: [
      "Let's see if I stay consistent and start blogging. This may devolve into a random amalgamation of thoughts, but I want to try to keep it focused on things I'm actually thinking about. I want to write more, and I want to write better. So here we go!",
    ],
    draft: false,
  },
];
