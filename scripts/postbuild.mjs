import { copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/*
  GitHub Pages serves 404.html for any path it has no file for, and keeps the
  requested URL in the address bar — so an identical copy of the app shell lets
  /writing/cs-373 load directly instead of dead-ending.
*/
copyFileSync(join(root, 'index.html'), join(root, '404.html'));
console.log('postbuild: wrote 404.html');
