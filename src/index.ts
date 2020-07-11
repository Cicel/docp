import vfs from 'vinyl-fs';
import watch from 'node-watch';
import path from 'path';
import inquirer from 'inquirer';
import { vol } from 'memfs';
import fs from 'fs';
import fsExtra from 'fs-extra';
import { ufs } from 'unionfs';
import parseMarkdown from './parse-markdown';
import startServer from './server';
import dest from './dest';
import docpConfig, { DocpConfig } from './model/docp-config';
import { inputOverride, inputRootDir, inputOutDir } from './prompt-action';
import { printLog } from './utils';
import filters from './filters';
import { patchFs } from 'fs-monkey';
import printURL from './print-URL';

export async function init(hasConfig) {
  let newConfig = docpConfig;
  if (hasConfig) {
    const { override } = await inquirer.prompt([inputOverride]);
    if (override === false) {
      return;
    }
    newConfig = new DocpConfig();
  }
  const { rootDir, outDir } = await inquirer.prompt([inputRootDir, inputOutDir]);
  newConfig.rootDir = rootDir;
  newConfig.outDir = outDir;
  newConfig.outputConfigFile();
  printLog.success('init done!');
}

export function dev() {
  // create virtual fs
  const virtualDir = '/memfs';
  ufs.use(vol as any).use({ ...fs });
  patchFs(ufs);
  fs.mkdirSync(virtualDir);
  // start server
  startServer();
  // first build
  vfs.src(docpConfig.getFilePath())
    .pipe(filters())
    .pipe(parseMarkdown())
    .pipe(dest(virtualDir))
    .pipe(printURL());
  // watch
  watch(docpConfig.getFileDir(), (evt, filePath) => {
    if (filePath.split('.').pop() !== 'md') {
      return;
    }
    if (evt === 'remove') {
      printLog.warn(filePath + ' removed');
      return;
    }
    vfs.src(filePath).pipe(parseMarkdown()).pipe(dest(virtualDir));
  });
}

export function build() {
  vfs.src(docpConfig.getFilePath())
    .pipe(filters())
    .pipe(parseMarkdown())
    .pipe(dest(docpConfig.outDir))
    .on('finish', () => {
      const outputDir = path.resolve(__dirname, docpConfig.outDir);
      fsExtra.copySync(path.resolve(__dirname, '../template/assets'), outputDir + '/assets');
      printLog.success('website generated at: ' + outputDir);
    });
}