import process from 'process';
import path from 'path';
import vfs from 'vinyl-fs';
import watch from 'node-watch';
import parseMarkdown from './parse-markdown';
import startServer from './server';
import devMode from './dev-mode';
import dest from './dest';
import docpConfig from './model/docp-config';
import inquirer from 'inquirer';
import { inputOverride, inputRootDir, inputOutDir } from './prompt-action';
import { printLog } from './utils';

export async function init(hasConfig) {
  if (hasConfig) {
    const { override } = await inquirer.prompt([inputOverride]);
    if (override === false) {
      return;
    }
  }
  const { rootDir, outDir } = await inquirer.prompt([inputRootDir, inputOutDir]);
  docpConfig.rootDir = rootDir
  docpConfig.outDir = outDir
  docpConfig.outputConfigFile();
  printLog.success('init done!');
}

export function dev() {
  // start server
  startServer();
  // first build
  vfs.src(path.resolve(process.cwd(), docpConfig.rootDir, '*.md')).pipe(parseMarkdown()).pipe(devMode());
  // watch
  watch(path.resolve(process.cwd(), docpConfig.rootDir), (evt, filePath) => {
    if (filePath.split('.').pop() !== 'md') {
      return;
    }
    if (evt === 'remove') {
      printLog.warn(filePath + ' removed');
      return;
    }
    vfs.src(filePath).pipe(parseMarkdown()).pipe(devMode());
  });
}

export function build() {
  return vfs.src(path.resolve(docpConfig.rootDir, '*.md')).pipe(parseMarkdown()).pipe(dest(docpConfig.outDir));
}
