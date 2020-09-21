import path from 'path';
import fse from 'fs-extra';
import beautify from 'js-beautify';

const configFileName = 'docp.config.js';

export class DocpConfig {
  header: PageHeader | null = null
  rootDir = ''
  outDir = 'docsite'
  summary = 'summary.md'
  file = ''
  port = 3000
  configPath = ''
  template: string = path.resolve(__dirname, '../../template/article.html')
  scripts: Array<string> = []
  styles: Array<string> = []
  showExecCode = true
  unfoldExecCode = false
  marked: MarkedOption = {
    breaks: true,
    gfm: true
  }

  /**
   * two kinds of value
   * string: "your/plugin/path"
   * Array: ["your/plugin/path", {options}]
   */
  plugins: any = {}
  virtualDir = '/memfs'

  concatConfigs(newConfig) {
    Object.keys(newConfig).forEach(key => {
      if (newConfig[key].toString() !== '[object Object]' || !this[key]) {
        this[key] = newConfig[key];
      } else {
        Object.assign(this[key], newConfig[key]);
      }
    });
  }

  getConfigFileDir() {
    return path.resolve(process.cwd(), this.configPath, configFileName);
  }

  hasConfigFile() {
    const configFile = this.getConfigFileDir();
    return fse.pathExistsSync(configFile);
  }

  outputConfigFile() {
    const result = `module.exports = {
        rootDir: '${this.rootDir}',
        outDir: '${this.outDir}',
        plugins: {}
      }`;
    fse.outputFileSync(this.getConfigFileDir(), beautify.js(result, { 'indent_size': 2 }));
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

  getOutputPath() {
    return path.resolve(process.cwd(), this.outDir);
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

  getPlugins() {
    const plugins = Object.assign({}, this.plugins);
    // default plugins
    if (!plugins['javascript']) {
      plugins['javascript'] = path.resolve(__dirname, '../plugin/javascript.js');
    }
    const result: any = [];
    let modulePath = '';
    let options = {};
    for (const i in plugins) {
      if (typeof plugins[i] === 'string') {
        modulePath = plugins[i];
      }
      if (Array.isArray(plugins[i])) {
        modulePath = require(plugins[i][0]);
        options = plugins[i][1];
      }
      if (modulePath) {
        const _path = path.resolve(modulePath);
        let module = null;
        if (fse.existsSync(_path)) {
          // path esm or cjs
          module = require(_path).default || require(_path);
        } else {
          // node_modules esm or cjs
          module = require(modulePath).default || require(modulePath);
        }
        result.push({ type: i, module, options: options });
      }
    }
    return result;
  }
}

export default new DocpConfig();