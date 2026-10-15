// Dependency-free check for public/ads.txt (and, after `npm run build`,
// dist/ads.txt) — main has no test framework installed, and this is a
// minimal hotfix branch, so this avoids adding one just for one file.
// Usage: node scripts/verify-ads-txt.mjs [dist/ads.txt]
import fs from 'fs';

const EXPECTED = 'google.com, pub-8872944621283840, DIRECT, f08c47fec0942fa0\n';
const target = process.argv[2] || 'public/ads.txt';

const body = fs.readFileSync(target, 'utf-8');

const checks = [
  ['is exactly the required line, nothing else', body === EXPECTED],
  ['does not contain <html', !body.toLowerCase().includes('<html')],
  ['has no BOM', !body.startsWith('﻿')],
];

let failed = false;
for (const [label, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} - ${target}: ${label}`);
  if (!ok) failed = true;
}

if (failed) {
  console.error(`\nBody was: ${JSON.stringify(body)}`);
  process.exit(1);
}
console.log(`\nAll checks passed for ${target}`);
