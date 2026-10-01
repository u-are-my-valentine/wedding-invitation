import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const exec = promisify(execFile);

const output = resolve(process.env.RUNNER_TEMP ?? '/tmp', 'wedding-pages');
await rm(output, { recursive: true, force: true });
await cp('docs', output, { recursive: true });
let html = await readFile(join(output, 'index.html'), 'utf8');
const assets = [...new Set(html.match(/https:\/\/warm-wedding-invitation-2027\.jhhj4llm\.chatgpt\.site\/images\/(?:wedding\/cover-lace-[\w.-]+|location\/invitation-paper\.[\w.-]+)/g))];
if (assets.length !== 5) throw new Error(`Expected five cover and paper assets, found ${assets.length}`);
await Promise.all(assets.map(async url => {
  const relativePath = new URL(url).pathname.slice(1);
  const destination = join(output, relativePath);
  await mkdir(resolve(destination, '..'), { recursive: true });
  await exec('curl', ['--fail', '--silent', '--show-error', '--location', '--retry', '3', '--max-time', '60', '--output', destination, url]);
  const bytes = await readFile(destination);
  const expectedHash = new URL(url).pathname.match(/\.([a-f0-9]{8})\.(avif|webp)$/)?.[1];
  if (!expectedHash || !createHash('sha256').update(bytes).digest('hex').startsWith(expectedHash)) {
    throw new Error(`Image hash mismatch: ${url}`);
  }
  console.log(`Packaged ${relativePath}: ${bytes.length} bytes`);
}));
for (const url of assets) html = html.replaceAll(url, `.${new URL(url).pathname}`);
await writeFile(join(output, 'index.html'), html);
console.log(`Pages artifact ready: ${output}`);
