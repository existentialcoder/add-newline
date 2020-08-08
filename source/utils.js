const path = require('path');
const isNonEmptyArray = (arr) => Array.isArray(arr) && Boolean(arr.length);

const ignoreExtensions = [
 '.png', '.jpg', '.gif',
 '.jpeg', '.ico', '.webp',
 '.mp3', '.mov', '.mp4',
 '.m4a', '.ogg', '.oga',
 '.wav', '.tiff', '.pdf',
 '.ppt', '.pptx', '.stl'
];

const filterByExtensions = (files, ignoreConfigs) => {
  return isNonEmptyArray(ignoreConfigs.extensions) ? files
    .filter(file => !ignoreConfigs.extensions.includes(path.extname(file))) : files;
};

const filterByDirs = (files, ignoreConfigs) => {
  if (!isNonEmptyArray(ignoreConfigs.dirs)) {
    return files;
  }

  return files
    .filter(file => !ignoreConfigs.dirs.some(dir => file.includes(dir)));
};


const filterByFiles = (files, ignoreConfigs) => {
  if (!isNonEmptyArray(ignoreConfigs.files)) {
    return files;
  }

  return files
    .filter(file => !ignoreConfigs.files.some(configFile => file.endsWith(configFile)));
};

const commonUtils = {
  ignoreExtensions,
  isNonEmptyArray
};

const fileFilters = {
  filterByExtensions,
  filterByDirs,
  filterByFiles
};

module.exports = {
    ...commonUtils,
    ...fileFilters,
};
