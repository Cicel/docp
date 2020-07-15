import path from 'path';
import fs from 'fs-extra';
import { MarkedOption } from '../typings/global';
import { stringify } from "javascript-stringify";

const configFileName = 'docp.config.js';

export class DocpConfig {
  rootDir = ''
  outDir = './docsite'
  summary = 'summary.md'
  file = ''
  port = 3000
  configPath = ''
  template: string = path.resolve(__dirname, '../../template/article.html')
  scripts: Array<string> = []
  styles: Array<string> = []
  showExecCode = true
  marked: MarkedOption = {
    breaks: true
  }

  /**
   * two kinds of value
   * string: "your/plugin/path"
   * Array: ["your/plugin/path", {options}]
   */
  plugins: any = {}
  virtualDir = '/memfs'

  concatConfigs(newConfig) {
    Object.keys(this).forEach(key => {
      if (newConfig[key] === undefined) {
        return;
      }
      if (newConfig[key].toString() === '[object Object]') {
        Object.assign(this[key], newConfig[key]);
        return;
      }
      this[key] = newConfig[key];
    });
  }

  getConfigFileDir() {
    return path.resolve(process.cwd(), this.configPath, configFileName);
  }

  hasConfigFile() {
    const configFile = this.getConfigFileDir();
    return fs.pathExistsSync(configFile);
  }

  outputConfigFile() {
    const output: any = {
      rootDir: this.rootDir,
      outDir: this.outDir,
      plugins: this.plugins
    };
    const result = 'module.exports = ' + stringify(output, null, 2);
    fs.outputFileSync(this.getConfigFileDir(), result);
  }

  getFilePath() {
    if (this.file) {
      return path.resolve(process.cwd(), this.file);
    }
    if (this.rootDir) {
      return path.resolve(this.rootDir, '*.md');
    }
    return path.resolve(process.cwd(), '*.md');
  }

  getFileDir() {
    if (this.file) {
      return path.resolve(process.cwd(), this.file);
    }
    if (this.rootDir) {
      return path.resolve(this.rootDir);
    }
    return process.cwd();
  }
}

export default new DocpConfig();