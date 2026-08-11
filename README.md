# armaanhirani.com

Personal site — React + TypeScript, built with Vite, served by GitHub Pages from the repo root.

## Running it

```bash
npm install
npm run dev      # local dev server
npm run build    # writes index.html + build/ + 404.html to the repo root
npm run typecheck
```

`npm run build` output is committed, because GitHub Pages serves this repo's root
directly (see `CNAME`). Run it before pushing any change you want live.

## Where things live

| What | Where |
| --- | --- |
| Links, roles, projects, skills | `src/content/profile.ts` |
| Creative media and notes | `src/content/creative.ts` |
| Course blog posts | `src/content/blogs.json` (typed by `blogs.ts`) |
| Colours, type, spacing | `src/styles/tokens.css` |

### Adding a photo to Creative

Drop the file in `assets/images/creative/`, then add an entry to `media` in
`src/content/creative.ts` with a `src` of `/assets/images/creative/<file>`.
Entries without a `src` render as a labelled empty frame.

### Publishing a note

Notes in `src/content/creative.ts` marked `draft: true` show a "draft" badge.
Replace the placeholder body text with your own and remove the flag.

## Routes

- `/` — everything on one page
- `/writing/cs-373`, `/writing/cs-371p` — the course blogs, deep-linkable per post
- `404.html` is a copy of the app shell so deep links work on GitHub Pages

## Video

Clips live in `assets/videos/creative/` as web-encoded h.264 (~2.5 Mbps) with a
poster frame each. The broadcast masters are **not** in this repo — re-encode
from those, never from these, if you need higher quality.

Grid previews use `preload="none"`, so only posters load until someone hovers.
Hover plays with sound and remembers where each clip was left; leaving pauses
without rewinding.

### On "blocking downloads"

The video elements set `controlsList="nodownload"`, `disablePictureInPicture`
and suppress the context menu. These are speed bumps only — anything the browser
can play, it has already downloaded, and the file URL is visible in devtools.
Real protection needs signed/expiring URLs and segmented (HLS) delivery, or DRM.
