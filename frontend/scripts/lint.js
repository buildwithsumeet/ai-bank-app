import fs from 'node:fs';
import path from 'node:path';
import { transformSync } from 'esbuild';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, '../src');

function getAllFrontendFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results = results.concat(getAllFrontendFiles(fullPath));
    } else if (item.isFile() && (item.name.endsWith('.js') || item.name.endsWith('.jsx'))) {
      results.push(fullPath);
    }
  }
  return results;
}

console.log('🔍 [Frontend Lint] Scanning React components and modules for JSX/ESM syntax errors...');

const files = getAllFrontendFiles(srcDir);
let errors = 0;

for (const file of files) {
  const relPath = path.relative(path.resolve(__dirname, '..'), file);
  try {
    const content = fs.readFileSync(file, 'utf-8');
    const loader = file.endsWith('.jsx') ? 'jsx' : 'js';
    transformSync(content, { loader });
    console.log(`  ✔ [PASS] ${relPath}`);
  } catch (err) {
    console.error(`  ❌ [FAIL] ${relPath}`);
    console.error(err.message);
    errors++;
  }
}

if (errors > 0) {
  console.error(`\n❌ [Frontend Lint Failed] Found ${errors} file(s) with syntax or JSX errors.`);
  process.exit(1);
} else {
  console.log(`\n✨ [Frontend Lint Passed] All ${files.length} React / JSX files passed verification!`);
}
