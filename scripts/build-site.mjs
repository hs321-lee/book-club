import { copyFileSync, lstatSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = join(root, 'dist');
const publicFiles = ['index.html', 'app.js', 'data.js', 'november-data.js', 'styles.css', 'tokens.css'];
const publicDirectories = {
  assets: new Set(['.svg', '.webp', '.jpg', '.jpeg', '.png', '.gif', '.avif', '.ico', '.woff', '.woff2']),
  mario: new Set(['.html', '.css', '.js']),
  meetings: new Set(['.html', '.css', '.js'])
};

function inspect(path) {
  const entry = lstatSync(join(root, path));
  if (entry.isSymbolicLink()) throw new Error(`Cannot publish symbolic link: ${path}`);
  return entry;
}

function collect(path, extensions) {
  for (const name of readdirSync(join(root, path))) {
    if (name.startsWith('.')) continue;
    const child = join(path, name);
    const entry = inspect(child);
    if (entry.isDirectory()) collect(child, extensions);
    else if (entry.isFile() && extensions.has(extname(name).toLowerCase())) publicFiles.push(child);
  }
}

for (const file of publicFiles) {
  if (!inspect(file).isFile()) throw new Error(`Expected public file: ${file}`);
}
for (const [directory, extensions] of Object.entries(publicDirectories)) {
  if (!inspect(directory).isDirectory()) throw new Error(`Expected public directory: ${directory}`);
  collect(directory, extensions);
}

rmSync(output, { recursive: true, force: true });
for (const file of publicFiles) {
  const destination = join(output, file);
  mkdirSync(dirname(destination), { recursive: true });
  copyFileSync(join(root, file), destination);
}
console.log(`Built ${publicFiles.length} public files in dist/`);
