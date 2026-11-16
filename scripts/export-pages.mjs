import { access, cp, readdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { games } from '../src/catalog.js';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'dist');
const entries = await readdir(output);
const allowed = new Set([
  'index.html',
  'assets',
  ...games.map((game) => game.route.split('/')[0]),
  ...(await readdir(resolve(root, 'public'))),
]);

for (const entry of entries) {
  if (!allowed.has(entry)) throw new Error(`Unexpected build output: ${entry}`);
}
await Promise.all([
  access(resolve(output, 'index.html')),
  access(resolve(output, '.nojekyll')),
  ...games.map((game) => access(resolve(output, game.route, 'index.html'))),
]);

for (const entry of entries) {
  const destination = resolve(root, entry);
  await rm(destination, { recursive: true, force: true });
  await cp(resolve(output, entry), destination, { recursive: true });
}

console.log(`Exported the homepage and ${games.length} games to the repository root.`);
