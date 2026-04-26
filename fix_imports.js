import fs from 'fs';
import path from 'path';

function replaceInFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  for (const [from, to] of replacements) {
    if (content.includes(from)) {
      content = content.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), to);
      changed = true;
    }
  }
  if (changed) fs.writeFileSync(filePath, content);
}

const routesDir = 'src/presentation/routes';
fs.readdirSync(routesDir).forEach(f => {
  const p = path.join(routesDir, f);
  replaceInFile(p, [
    ['../../../infrastructure/', '../../infrastructure/'],
    ['../middleware/', '../../middleware/'],
    ['../config.js', '../../config.js'],
    ['../lib/', '../../lib/'],
    ['../controllers/', '../controllers/']
  ]);
});

replaceInFile('src/presentation/controllers/resumeController.js', [
  ['../../../infrastructure/', '../../infrastructure/'],
  ['../infrastructure/', '../../infrastructure/'],
  ['../application/', '../../application/'],
  ['../repositories/resumeRepository.js', '../../infrastructure/repositories/resumeRepository.js']
]);

replaceInFile('api/index.js', [
  ['../src/db/pool.js', '../src/infrastructure/database/pool.js'],
  ["'..', 'src', 'db', 'schema.sql'", "'..', 'src', 'infrastructure', 'database', 'schema.sql'"]
]);

replaceInFile('src/server.js', [
  ["'db', 'schema.sql'", "'infrastructure', 'database', 'schema.sql'"]
]);

