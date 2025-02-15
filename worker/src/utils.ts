import fs from 'fs';
import path from 'path';

const EXPIRATION_TIME_MS = 60 * 60 * 1000;

export function deleteOldFiles(directory: string) {
    fs.readdir(directory, (err, files) => {
        if (err) {
            console.error(`❌ Failed to read ${directory}:`, err);
            return;
        }

        const now = Date.now();

        files.forEach(file => {
            const filePath = path.join(directory, file);
            fs.stat(filePath, (err, stats) => {
                if (err) {
                    console.error(`⚠ Error reading file ${filePath}:`, err);
                    return;
                }

                if (now - stats.mtimeMs > EXPIRATION_TIME_MS) {
                    fs.unlink(filePath, err => {
                        if (err) {
                            console.error(`❌ Failed to delete ${filePath}:`, err);
                        } else {
                            console.log(`🗑 Deleted old file: ${filePath}`);
                        }
                    });
                }
            });
        });
    });
}
