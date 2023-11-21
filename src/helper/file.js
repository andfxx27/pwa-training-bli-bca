/**
 * Generate key from supplied fileName
 * @param {string} fileName - complete file name with extension
 */
export function generateKeyFromFileName(fileName) {
  const splittedFileName = fileName.split('.');
  let fileKey = '';

  splittedFileName.forEach((part, index) => {
    if (index < splittedFileName.length - 1) {
      fileKey += part;
    }
  });

  return fileKey;
}
