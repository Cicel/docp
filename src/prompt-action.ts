import colors from 'colors';

export const inputRootDir = {
  type: 'input',
  name: 'rootDir',
  message: colors.white('root directory of input files:'),
  default: './'
};

export const inputOutDir = {
  type: 'input',
  name: 'outDir',
  message: colors.white('directory for output files:'),
  default: 'docsite'
};

export const inputOverride = {
  type: 'confirm',
  name: 'override',
  message: colors.white('docp.config.js already exists, overwrite?'),
  default: 'N'
};