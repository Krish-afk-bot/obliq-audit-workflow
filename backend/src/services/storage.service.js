const path = require('path');
const fs = require('fs');

class StorageService {
  /**
   * Returns the absolute path on disk for a given storage filename
   */
  static getFilePath(filename) {
    // Prevent directory traversal
    const safeFilename = path.basename(filename);
    const fullPath = path.resolve(__dirname, '../../uploads', safeFilename);
    return fullPath;
  }

  /**
   * Generates a relative or full URL for file retrieval
   */
  static generateFileUrl(filename, documentId) {
    return `/api/documents/${documentId}/file?file=${encodeURIComponent(filename)}`;
  }

  /**
   * Checks if file exists on disk
   */
  static fileExists(filename) {
    const fullPath = this.getFilePath(filename);
    return fs.existsSync(fullPath);
  }
}

module.exports = StorageService;
