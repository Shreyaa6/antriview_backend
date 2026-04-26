import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const dirsToMake = [
  'src/presentation/controllers',
  'src/presentation/routes',
  'src/infrastructure/repositories',
  'src/infrastructure/database'
];

dirsToMake.forEach(d => fs.mkdirSync(d, { recursive: true }));

// Move files
try {
  execSync('mv src/controllers/* src/presentation/controllers/ 2>/dev/null || true');
  execSync('mv src/routes/* src/presentation/routes/ 2>/dev/null || true');
  execSync('mv src/repositories/* src/infrastructure/repositories/ 2>/dev/null || true');
  execSync('mv src/db/* src/infrastructure/database/ 2>/dev/null || true');
  execSync('rm -rf src/controllers src/routes src/repositories src/db 2>/dev/null || true');
} catch(e) {}

function replaceInFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  for (const [from, to] of replacements) {
    if (new RegExp(from).test(content)) {
      content = content.replace(new RegExp(from, 'g'), to);
      changed = true;
    }
  }
  if (changed) fs.writeFileSync(filePath, content);
}

// Update imports
const replaceMap = [
  ['\\.\\./repositories/', '../../infrastructure/repositories/'],
  ['\\.\\./db/', '../../infrastructure/database/'],
  ['\\./routes/', './presentation/routes/'],
  ['\\./db/', './infrastructure/database/'],
  ['\\.\\./controllers/', '../controllers/'],
  ['\\.\\./infrastructure/repositories/usersRepository\\.js', '../../infrastructure/repositories/usersRepository.js']
];

const files = [];
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (full.endsWith('.js')) files.push(full);
  });
}
walk('src');
walk('api');

files.forEach(f => replaceInFile(f, replaceMap));
console.log('Refactor complete');
