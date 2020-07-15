#!/usr/bin/env node --no-warnings
import process from 'process';
import { dev, build, init } from './index';
import docpConfig from './model/docp-config';
import { printLog } from './utils';
import program from 'commander';

const { version } = require('../package.json');
// 覆盖原始方法，提供自定义help info
program.helpOption('-phi, --primary-help-indo', 'primary help info');

program
  .option('-h, --help')
  .option('--rootDir <dir>')
  .option('--outDir <dir>')
  .option('--file <path>')
  .option('--config <path>')
  .option('--port <port>')
  .option('--configPath <path>')
  .option('--template <path>')
  .option('--scripts <string[]>')
  .option('--styles <string[]>')
  .parse(process.argv);

// show help
if (process.argv.length === 2 || process.argv.indexOf('--help') > -1 || process.argv.indexOf('-h') > -1) {
  console.log('Docp version ' + version);
  console.log('');
  console.log('Commands:');
  console.log('  init  [options]    Initialize and create docp.config.js to current dir.');
  console.log('  dev   [options]    Watch and preview locally.');
  console.log('  build [options]    Compile and output to the outDir.');
  console.log('');
  console.log('Options:');
  console.log('  -h, --help         Print this message.');
  console.log('  --rootDir          Specifies the root directory of input files. Default to current directory.');
  console.log('  --outDir           Specifies the directory for output files. Default to ./docsite.');
  console.log('  --file             Specifies the file to be compiled.');
  console.log('  --port             Specify local server port.');
  console.log('  --configPath       Specify the configuration file path when init.');
  console.log('  --template         Specify the HTML template to replace the built-in template.');
  console.log('  --scripts          External scripts included in HTML template, Commonly used for public libraries like React or Vue.');
  console.log('  --styles           External styles included in HTML template.');
  process.exit(0);
}

// argv转config
docpConfig.concatConfigs(program);

const hasConfig = docpConfig.hasConfigFile();
// 存在配置文件优先使用
if (hasConfig) {
  const configFile = docpConfig.getConfigFileDir();
  const docpConfigFile = require(configFile);
  docpConfig.concatConfigs(docpConfigFile);
}

const script = process.argv[2];

if (script === 'init') {
  init(hasConfig);
}

if (script === 'dev') {
  dev();
}

if (script === 'build') {
  build();
}

process.on('uncaughtException', function (err: any) {
  printLog.error(err);
});

process.on('unhandledRejection', function (err: any) {
  printLog.error(err);
});
