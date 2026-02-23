// update-latest-yml.js
// Usage: node update-latest-yml.js <path-to-installer> <path-to-latest.yml>

const fs = require('fs');
const crypto = require('crypto');
const yaml = require('js-yaml');
const path = require('path');

if (process.argv.length !== 4) {
  console.error('Usage: node update-latest-yml.js <installer> <latest.yml>');
  process.exit(1);
}

const installerPath = process.argv[2];
const latestYmlPath = process.argv[3];

// Calculate SHA-512 checksum
function getSha512(filePath) {
  const hash = crypto.createHash('sha512');
  const fileBuffer = fs.readFileSync(filePath);
  hash.update(fileBuffer);
  return hash.digest('base64');
}

// Get file size
function getFileSize(filePath) {
  return fs.statSync(filePath).size;
}

const sha512 = getSha512(installerPath);
const size = getFileSize(installerPath);

// Read and update latest.yml
// type LatestYml = {
//   version: string;
//   files: Array<{ url: string; sha512: string; size: number }>;
//   path: string;
//   sha512: string;
//   releaseDate: string;
// };

const latestYml = yaml.load(fs.readFileSync(latestYmlPath, 'utf8'));

// Update fields
if (Array.isArray(latestYml.files) && latestYml.files.length > 0) {
  latestYml.files[0].sha512 = sha512;
  latestYml.files[0].size = size;
}
latestYml.sha512 = sha512;
latestYml.path = path.basename(installerPath);

// Write back to latest.yml
fs.writeFileSync(latestYmlPath, yaml.dump(latestYml, { lineWidth: -1 }));

console.log('latest.yml updated successfully.');
