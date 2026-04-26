import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.js')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('src');
files.push('api/index.js');

let brokenCount = 0;
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const dir = path.dirname(file);
  const imports = content.match(/from\s+['"]([^'"]+)['"]/g) || [];
  imports.forEach(imp => {
    const p = imp.match(/from\s+['"]([^'"]+)['"]/)[1];
    if (p.startsWith('.')) {
      const target = path.resolve(dir, p);
      if (!fs.existsSync(target) && !fs.existsSync(target + '.js') && !fs.existsSync(target + '/index.js')) {
        console.log(`Broken import in ${file}: ${p} -> ${target}`);
        brokenCount++;
      }
    }
  });
});
if (brokenCount === 0) console.log('All imports valid!');
