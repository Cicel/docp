import Vinyl from 'vinyl';
import marked from 'marked';
import { JSDOM } from "jsdom";
import docpConfig from './docp-config';
import path from 'path';
import fs from 'fs';
import { getHightlightComponentByType } from '../utils';
import { ExecableCode } from '../typings/global';

export enum PAGE_TYPE {
  SUMMARY,
  CONTENT
}

export default class Page {
  static globalSummaryFile: Vinyl | null = null
  contentFile: Vinyl | null = null
  // 外部赋值
  inlineSources: Array<string> = []
  // 外部赋值
  externalSources: Array<string> = []
  execCodes: Map<string, Array<ExecableCode>> = new Map()
  infoStrings: Map<string, boolean> = new Map()
  type = PAGE_TYPE.CONTENT

  async generate(markdownFile: Vinyl) {
    if (markdownFile.stem.toUpperCase() === 'SUMMARY') {
      Page.globalSummaryFile = await this.generateSummary(markdownFile);
      this.type = PAGE_TYPE.SUMMARY;
      return;
    }
    this.contentFile = await this.generatePage(markdownFile);
  }

  outputHTML(): Vinyl | null {
    const commonScripts = docpConfig.scripts;
    const commonStyles = docpConfig.styles;
    const template = fs.readFileSync(path.resolve(process.cwd(), docpConfig.template)).toString();
    const document = new JSDOM(template).window.document;

    // 添加内容
    document.querySelector('#docp-content').innerHTML = this.contentFile!.contents!.toString();
    if (Page.globalSummaryFile !== null) {
      const summaryDOM = new JSDOM(Page.globalSummaryFile.contents?.toString());
      // 遍历summaryDOM
      const list: any = summaryDOM?.window.document.querySelectorAll('a');
      const root: any = summaryDOM?.window.document.querySelector('ul');
      for (let i = 0; i < list.length; i++) {
        let element = list[i];
        let deep = 0;
        while (element !== root) {
          element = element.parentElement;
          deep = deep + 1;
        }
        list[i].classList.add('deep-' + deep);
        // highlight menu item
        if (list[i].href === this.contentFile!.basename) {
          list[i].classList.add('current');
        }
      }
      document.querySelector('#docp-menu').appendChild(root);
    } else {
      // 无目录内容居中
      document.querySelector('#docp-content').style = 'margin: 0 auto;';
      document.querySelector('#docp-menu').remove();
    }
    // 插入css样式
    commonStyles.forEach(href => {
      const link = document.createElement('link');
      link.href = href;
      document.querySelector('head').appendChild(link);
    });
    // 插入js外链
    commonScripts.forEach(src => {
      const script = document.createElement('script');
      script.src = src;
      document.querySelector('head').appendChild(script);
    });
    // 插入高亮代码
    for (const type of this.infoStrings.keys()) {
      const hightlightComponent = getHightlightComponentByType(type);
      // 插入高亮脚本
      if (hightlightComponent) {
        const script = document.createElement('script');
        script.src = hightlightComponent;
        document.querySelector('body').appendChild(script);
      }
    }
    // 插入inlineSource
    this.inlineSources.forEach(source => {
      const script = document.createElement('script');
      script.innerHTML = source;
      document.querySelector('body').appendChild(script);
    });
    // 插入externalSource
    this.externalSources.forEach(src => {
      const script = document.createElement('script');
      script.src = src;
      document.querySelector('head').appendChild(script);
    });
    const result = this.contentFile?.clone() || null;
    if (result) {
      result.contents = Buffer.from(document.querySelector('html').outerHTML);
    }
    return result;
  }

  private async generatePage(markdown: Vinyl): Promise<Vinyl> {
    const renderer = new marked.Renderer();
    const primaryRenderCode = renderer.code;
    renderer.code = this.generateCode(markdown, primaryRenderCode.bind(renderer));
    const options = Object.assign({}, docpConfig.marked, { renderer: renderer });
    const result = await marked(markdown.contents!.toString(), options);
    const file = markdown;
    file.contents = Buffer.from(result);
    file.extname = '.html';
    return file;
  }

  private async generateSummary(markdown: Vinyl): Promise<Vinyl> {
    const result = await marked(markdown.contents!.toString(), docpConfig.marked);
    const templateDOM = new JSDOM(result);
    const summary = templateDOM.window.document.querySelector('ul');
    if (!summary) {
      return Promise.reject(null);
    }
    // 替换href中连接后缀
    const list = summary.querySelectorAll('a');
    for (let i = 0; i < list.length; i++) {
      list[i].href = list[i].href.replace('.md', '.html');
    }
    const file = markdown;
    file.contents = Buffer.from(summary.outerHTML);
    file.extname = '';
    return file;
  }

  private generateCode(markdown: Vinyl, primaryRenderCode): Function {
    let index = 0;
    return (codeString: string, infostring = 'markup', escaped: string): string => {
      index++;
      const { codeType, execType, showExecCode } = this.parseInfoString(infostring);
      // 渲染代码块
      let result = primaryRenderCode(codeString, codeType, escaped);
      // 记录infostring，插入hightlight代码
      this.infoStrings.set(codeType, true);
      // 添加line-numbers
      result = result.replace('<pre>', `<pre class="line-numbers language-${codeType}">`);
      if (execType) {
        const containerId = markdown.stem + '_' + index;
        const container = `<div id="${containerId}"></div>`;
        const code: ExecableCode = {
          origin: markdown,
          containerId: containerId,
          type: execType,
          value: codeString.replace('$CONTAINER_ID', `'${containerId}'`), // 替换占位符$CONTAINER_ID
        };
        if (!this.execCodes.has(execType)) {
          this.execCodes.set(execType, []);
        }
        this.execCodes.get(execType)!.push(code);
        // 包裹codeblock容器
        result = this.wrapCodeBlock(container, result, showExecCode);
      }
      return result;
    };
  }

  /**
   * 解析参数
   * @param infostring
   */
  private parseInfoString(infostring: string): any {
    const args = infostring.split('--');
    let codeType: string = ''
    let execType: string = ''
    let showExecCode: boolean = docpConfig.showExecCode
    args.forEach((item, index) => {
      if (index === 0) {
        codeType = item.toLowerCase().trim()
        return;
      }
      if (item.startsWith('exec')) {
        execType = (item.split('=')[1] || 'javascript').trim()
        return
      }
      if (item.startsWith('show')) {
        showExecCode = item.split('=')[1] === 'false' ? false : true
        return
      }
    })
    return {
      codeType: codeType,
      execType: execType,
      showExecCode: showExecCode
    };
  }

  /**
   * 为可执行区域组装结构
   */
  private wrapCodeBlock(execBlock, codeBlock, showExecCode): string {
    let result = `<div class="docp-block">
      <div class="docp-exec-block">${execBlock}</div>
        {{codeBlock}}
        {{controlBlock}}
      </div>
    `;
    const codeBlockString = showExecCode ? `<div class="docp-code-block">${codeBlock}</div>` : '';
    const controlBlockString = showExecCode ? '<div class="docp-control-block"></div>' : '';
    result = result.replace('{{codeBlock}}', codeBlockString);
    result = result.replace('{{controlBlock}}', controlBlockString);
    return result;
  }
}
