import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, '../src');

function getAllJsFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results = results.concat(getAllJsFiles(fullPath));
    } else if (item.isFile() && item.name.endsWith('.js')) {
      results.push(fullPath);
    }
  }
  return results;
}

console.log('🔍 [Backend Lint] Scanning backend source files for syntax and ESM errors...');

const files = getAllJsFiles(srcDir);
let errors = 0;

for (const file of files) {
  const relPath = path.relative(path.resolve(__dirname, '..'), file);
  try {
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
    console.log(`  ✔ [PASS] ${relPath}`);
  } catch (err) {
    console.error(`  ❌ [FAIL] ${relPath}`);
    console.error(err.stderr ? err.stderr.toString() : err.message);
    errors++;
  }
}

if (errors > 0) {
  console.error(`\n❌ [Backend Lint Failed] Found ${errors} file(s) with syntax errors.`);
  process.exit(1);
} else {
  console.log(`\n✨ [Backend Lint Passed] All ${files.length} JavaScript files passed syntax verification!`);
}
