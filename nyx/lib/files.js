const fs = require('fs');
const path = require('path');

module.exports = {
  getCurrentDirectory: () => {
    return process.cwd();
  },

  getCurrentDirectoryBase: () => {
    return path.basename(process.cwd());
  },

  directoryExists: (filePath) => {
    return fs.existsSync(filePath);
  }
}