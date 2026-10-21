/**
 * Fills in any missing project preview in `public/previews/`.
 *
 * The projects worth showing are listed in
 * `src/components/v2/previews.json`, which is also what the panel reads, so
 * there is one list rather than two. A preview that already exists is left
 * alone: this only captures what is not there yet, so adding a project means
 * adding it to that file and running this.
 *
 *   npm run previews          # capture whatever is missing
 *   npm run previews -- --all # recapture everything
 *
 * Needs Playwright, which is not a dependency of this project because it
 * pulls a browser down with it and nothing else here wants one:
 *
 *   npm i -D playwright && npx playwright install chromium
 *
 * Without it the script says what is missing and exits 0 rather than failing
 * a build — the committed previews are what the site ships, and a machine
 * with no browser should still be able to build.
 */

import { access, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = resolve(ROOT, 'public');
const LIST = resolve(ROOT, 'src/components/v2/previews.json');

/** What the shots are captured at, and the ratio App.css states for them. */
const VIEWPORT = { width: 1280, height: 800 };

const all = process.argv.includes('--all');

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const previews = JSON.parse(await readFile(LIST, 'utf8'));

  const wanted = [];
  for (const [key, { url, file }] of Object.entries(previews)) {
    const out = resolve(PUBLIC, file);
    if (!all && (await exists(out))) continue;
    wanted.push({ key, url, out });
  }

  if (wanted.length === 0) {
    console.log('previews: nothing missing');
    return;
  }

  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch {
    console.log(
      `previews: ${wanted.length} missing (${wanted
        .map((item) => item.key)
        .join(', ')}), and Playwright is not installed.\n` +
        '  npm i -D playwright && npx playwright install chromium'
    );
    return;
  }

  await mkdir(resolve(PUBLIC, 'previews'), { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: VIEWPORT });

  for (const { key, url, out } of wanted) {
    process.stdout.write(`previews: ${key} … `);
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 45_000 });
      // Above the fold only — the panel shows these at about 130px wide, so
      // a full-page shot would be an unreadable strip.
      await page.screenshot({ path: out, quality: 72, type: 'jpeg' });
      console.log('captured');
    } catch (error) {
      console.log(`failed — ${error.message}`);
    }
  }

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
