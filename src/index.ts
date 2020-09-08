import vfs from 'vinyl-fs';
import watch from 'node-watch';
import path from 'path';
import inquirer from 'inquirer';
import fs2 from './fs2';
import fse from 'fs-extra';
import parseMarkdown from './parse-markdown';
import startServer from './server';
import dest from './dest';
import docpConfig, { DocpConfig } from './model/docp-config';
import { inputOverride, inputRootDir, inputOutDir } from './prompt-action';
import { printLog } from './utils';
import filters from './filters';
import printURL from './print-URL';

// create virtual dir
fs2.mkdirSync(docpConfig.virtualDir);

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
  if (fse.pathExistsSync(outputDir)) {
    fse.removeSync(outputDir)
  }
  return parse(docpConfig.getFilePath(), docpConfig.getOutputPath()).on('finish', () => {
    fse.copySync(path.resolve(__dirname, '../template/assets'), outputDir + '/assets');
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

