import { createReadStream, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const MIME: Record<string, string> = {
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
};

/**
 * `assets/` lives at the repo root, outside Vite's `root: 'src'`, so in dev the
 * SPA fallback answered /assets/* with index.html — video elements got HTML and
 * failed to demux. Production is fine (Pages serves the repo root), this just
 * makes dev match it. Range requests included, or video seeking won't work.
 */
function serveRepoAssets(): Plugin {
  return {
    name: 'serve-repo-assets',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/assets', (req, res, next) => {
        const rel = normalize(decodeURIComponent((req.url ?? '/').split('?')[0]));
        if (rel.includes('..')) return next();

        const file = join(process.cwd(), 'assets', rel);
        let stat;
        try {
          stat = statSync(file);
        } catch {
          return next();
        }
        if (!stat.isFile()) return next();

        const type = MIME[extname(file).toLowerCase()] ?? 'application/octet-stream';
        const range = req.headers.range;

        if (range) {
          const [startRaw, endRaw] = range.replace(/bytes=/, '').split('-');
          const start = Number(startRaw) || 0;
          const end = endRaw ? Number(endRaw) : stat.size - 1;
          res.writeHead(206, {
            'Content-Type': type,
            'Content-Range': `bytes ${start}-${end}/${stat.size}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': end - start + 1,
          });
          createReadStream(file, { start, end }).pipe(res);
          return;
        }

        res.writeHead(200, {
          'Content-Type': type,
          'Content-Length': stat.size,
          'Accept-Ranges': 'bytes',
        });
        createReadStream(file).pipe(res);
      });
    },
  };
}

// The site is served by GitHub Pages straight out of the repo root (see CNAME),
// so the build lands next to `assets/` rather than in a throwaway dist folder.
export default defineConfig({
  plugins: [react(), serveRepoAssets()],
  root: 'src',
  publicDir: false,
  // Listen on the LAN so the site can be opened from a phone on the same network.
  server: { host: true },
  build: {
    outDir: '..',
    emptyOutDir: false,
    assetsDir: 'build',
    rollupOptions: {
      output: {
        entryFileNames: 'build/[name]-[hash].js',
        chunkFileNames: 'build/[name]-[hash].js',
        assetFileNames: 'build/[name]-[hash][extname]',
      },
    },
  },
});
