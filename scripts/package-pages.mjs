import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const exec = promisify(execFile);

const imageOrigin = (process.env.WEDDING_IMAGE_ORIGIN ?? 'https://warm-wedding-invitation-2027.jhhj4llm.chatgpt.site').replace(/\/$/, '');
const assets = new Map([
  ['images/wedding/0100.webp', 'ff4441324dd6cc10bb272d4690b437da563bb48bd87a913b954d9327642167b2'],
  ['images/location/invitation-paper.15f8cfbb.webp', '15f8cfbb80a95102dd11cef06dba65c2cf7f547cbf461692a4b2802e2f967648'],
]);
const output = resolve(process.env.RUNNER_TEMP ?? '/tmp', 'wedding-pages');
await rm(output, { recursive: true, force: true });
await cp('docs', output, { recursive: true });
let html = await readFile(join(output, 'index.html'), 'utf8');

for (const [path, expectedHash] of assets) {
  const src = `${imageOrigin || '.'}/${path}`;
  if (!html.includes(src)) throw new Error(`Missing cover asset reference: ${src}`);
  const destination = join(output, path);
  if (imageOrigin) {
    await mkdir(dirname(destination), { recursive: true });
    await exec('curl', ['--fail', '--silent', '--show-error', '--location', '--retry', '3', '--max-time', '60', '--output', destination, src]);
  }
  const bytes = await readFile(destination);
  if (createHash('sha256').update(bytes).digest('hex') !== expectedHash) {
    throw new Error(`Image hash mismatch: ${src}`);
  }
  html = html.replaceAll(src, `./${path}`);
  console.log(`Packaged ${path}: ${bytes.length} bytes`);
}
await writeFile(join(output, 'index.html'), html);
console.log(`Pages artifact ready: ${output}`);
