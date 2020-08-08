const fs = require('fs');
const path = require('path');
const {
  IGNORED_EXTENSIONS,
  isNonEmptyArray,
  filterByExtensions,
  filterByDirs,
  filterByFiles,
} = require('./utils');

const DEFAULT_OPTIONS = {
  ignore: {
    // TODO: Find an alternate method to stop writing to media files
    extensions: IGNORED_EXTENSIONS,
    dirs: [],
    files: []
  },
  includeHiddenFiles: false
};

// Retrieve all files in directory
const getAllFiles = (dir, allFiles) => {
  allFiles = allFiles || [];
  const dirFiles = fs.readdirSync(dir);

  dirFiles.forEach(dirFile => {
    const currentDir = path.join(dir, dirFile);
    fs.statSync(currentDir).isDirectory(dir)
      ? allFiles = getAllFiles(currentDir, allFiles)
      : allFiles.push(currentDir);
  });

  return allFiles;
}

// Get configs from json file in dir
const getConfigs = () => {
  const configsFile = `${process.cwd()}/.addlinesrc.json`;

  if (!fs.existsSync(configsFile)) {
    return DEFAULT_OPTIONS;
  }

  return require(configsFile);
}

// Check if a file is hidden. 
const isHiddenFile = (file) => (/(^|\/)\.[^\/\.]/g).test(file);

// get valid files to add new line to
const getFilesToProcess = (files, configs) => {
  let filesToProcess = [];
  const hiddenFiles = files.filter(isHiddenFile); 

  filesToProcess = configs.includeHiddenFiles ? hiddenFiles
    : files.filter(file => !hiddenFiles.includes(file));

  if (!configs.hasOwnProperty('ignore')) {
    filesToProcess = [
      ...filesToProcess,
      files,
    ];
  } else {
    // Filter by file extensions
    filesToProcess = filterByExtensions(filesToProcess, configs.ignore);

    // Filter by dirs
    filesToProcess = filterByDirs(filesToProcess, configs.ignore);

    // Filter by files
    filesToProcess = filterByFiles(filesToProcess, configs.ignore);
  }

  return filesToProcess;
}

// Add new line to the file
const addNewLine = (file) => {
  let fileContent = fs.readFileSync(file).toString();
  const partialFileName = file.replace(`${process.cwd()}/`, '');

  if (fileContent.endsWith('\n')) {
    console.log(`New line already exists for file ${partialFileName}`);
    return;
  }

  fileContent = `${fileContent}\n`;

  console.log(`Writing new line for the file ${partialFileName}`);
  try {
    return fs.writeFileSync(file, fileContent);
  } catch(er) {
    console.error(`Couldnt write to ${partialFileName}! Check read/write permissions to this directory`);
    process.exit(1);
  }
};

// Get files from args
const getFilesFromArgs = () => {
  return process.argv.slice(2)
    .map(file => path.join(process.cwd(), file));
}

// Main application
const mainApp = () => {
  const filesFromArgs = getFilesFromArgs();

  if (isNonEmptyArray(filesFromArgs)) {
    // Skip configs if files are passed in command
    console.log('Skipping configs');
    filesFromArgs.forEach(addNewLine);
    return process.exit(1);
  }

  const allFiles = getAllFiles(process.cwd());
  const configs = getConfigs();
  const filesToProcess = getFilesToProcess(allFiles, configs);

  if (!filesToProcess.length) {
    console.log('No files to add new line');
    process.exit(1);
  }

  // Add new lines to picked files
  filesToProcess.forEach(addNewLine);
}

mainApp();

module.exports = mainApp;
