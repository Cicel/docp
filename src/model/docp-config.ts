import path from 'path';
import fs from 'fs-extra';
import { MarkedOption } from '../typings/global';

const configFileName = 'docp.config.js';

class DocpConfig {
  rootDir: string = ''
  outDir: string = ''
  file: string = ''
  port: number = 3000
  configPath: string = ''
  template: string = path.resolve(__dirname, '../../template/article.html')
  scripts: Array<string> = []
  styles: Array<string> = []
  marked: MarkedOption | null = null
  plugins: any = {}

  getConfigFileDir() {
    return path.resolve(process.cwd(), this.configPath, configFileName)
  }

  hasConfigFile() {
    const configFile = this.getConfigFileDir();
    return fs.pathExistsSync(configFile);
  }

  outputConfigFile() {
    const output:any = {
      rootDir: this.rootDir,
      outDir: this.outDir,
      template: this.template,
      plugins: this.plugins
    }
    const result = 'module.exports = ' + JSON.stringify(output, null, 2)
    fs.outputFileSync(this.getConfigFileDir(), result);
  }

  getFilePath() {
    if (this.file) {
      return this.file
    }
    if (this.rootDir) {
      return path.resolve(this.rootDir, '*.md')
    }
    return path.resolve(process.cwd(), '*.md')
  }

  getFileDir() {
    if (this.file) {
      return this.file
    }
    if (this.rootDir) {
      return this.rootDir
    }
    return process.cwd()
  }
}

export default new DocpConfig()