import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';

/**
 * @implements {IFileService}
 */
class LocalFileService {
  constructor() {
    this.tempDir = path.join(process.cwd(), 'temp');
    if (!fsSync.existsSync(this.tempDir)) {
      fsSync.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  async saveTempFile(fileName, content) {
    const filePath = path.join(this.tempDir, fileName);
    await fs.writeFile(filePath, content, 'utf8');
    return filePath;
  }
}

export default LocalFileService;
