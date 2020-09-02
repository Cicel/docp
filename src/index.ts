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
    // reset docpConfig
    newConfig = new DocpConfig();
  }
  const { rootDir, outDir } = await inquirer.prompt([inputRootDir, inputOutDir]);
  newConfig.rootDir = rootDir;
  newConfig.outDir = outDir;
  newConfig.outputConfigFile();
  printLog.success('init done!');
}

export function serve() {
  // create virtual fs
  ufs.use(vol as any).use({ ...fs });
  patchFs(ufs);
  fs.mkdirSync(docpConfig.virtualDir);
  // start server
  startServer();
  // first build
  parse(docpConfig.getFilePath(), docpConfig.virtualDir).pipe(printURL());
  // watch
  watch(docpConfig.getFileDir(), (evt, filePath) => {
    if (filePath.split('.').pop() !== 'md') {
      return;
    }
    if (evt === 'remove') {
      printLog.warn(filePath + ' removed');
      return;
    }
    // summary变更触发全量更新
    if (filePath.endsWith('summary.md')) {
      parse(docpConfig.getFilePath(), docpConfig.virtualDir)
    } else {
      parse(filePath, docpConfig.virtualDir)
    }
  });
}

export function build(finishHandler?: Function) {
  const outputDir = path.resolve(docpConfig.outDir)
  if (fsExtra.pathExistsSync(outputDir)) {
    fsExtra.removeSync(outputDir)
  }
  return parse(docpConfig.getFilePath(), docpConfig.getOutputPath()).on('finish', () => {
    fsExtra.copySync(path.resolve(__dirname, '../template/assets'), outputDir + '/assets');
    printLog.success('website generated at: ' + outputDir);
    if (typeof finishHandler === 'function') {
      finishHandler()
    }
  });
}

export function parse(input: string, output: string) {
  const source = vfs.src(input)
  let result = source.pipe(filters()).pipe(parseMarkdown())
  const plugins = docpConfig.getPlugins()
  // concat plugins
  while (plugins.length > 0) {
    const { module, options } = plugins.pop()
    result = result.pipe(module(options))
  }
  return result.pipe(dest(output))
}

