import Vinyl from 'vinyl';
import marked from 'marked';
import { JSDOM } from "jsdom";
import docpConfig from './docp-config';
import path from 'path';
import fs from 'fs-extra';
import { getHightlightComponentByType } from '../utils';
import { ICode } from '../typings/global';

export enum PAGT_TYPE {
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
  execCodes: Map<string, Array<ICode>> = new Map()
  infoStrings:  Map<string, boolean> = new Map()
  type = PAGT_TYPE.CONTENT

  async generate(markdownFile: Vinyl) {
    if (markdownFile.stem.toUpperCase() === 'SUMMARY') {
      Page.globalSummaryFile = await this.generateSummary(markdownFile)
      this.type = PAGT_TYPE.SUMMARY
      return
    }
    this.contentFile = await this.generatePage(markdownFile)
  }

  outputHTML(): Vinyl | null {
    const commonScripts = docpConfig.scripts;
    const commonStyles = docpConfig.styles;
    const template = fs.readFileSync(path.resolve(process.cwd(), docpConfig.template)).toString();
    const document = new JSDOM(template).window.document;

    // 添加内容
    document.querySelector('#slot').innerHTML = this.contentFile!.contents!.toString();
    if (Page.globalSummaryFile !== null) {
      const summaryDOM = new JSDOM(Page.globalSummaryFile!.contents?.toString());
      const list: any = summaryDOM?.window.document.querySelectorAll('a');
      for (let i = 0; i < list.length; i++) {
        if (list[i].href.indexOf(encodeURIComponent(this.contentFile!.stem)) > -1) {
          list[i].classList.add('current');
          break;
        }
      }
      // summaryDOM.querySelector()
      document.querySelector('.docp-menu').innerHTML = summaryDOM.window.document.body.innerHTML;
    } else {
      // 无目录内容居中
      document.querySelector('.markdown-body').style = 'margin: 0 auto;'
      document.querySelector('.sidebar').remove();
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
    })
    // 插入externalSource
    this.externalSources.forEach(src => {
      const script = document.createElement('script');
      script.src = src;
      document.querySelector('head').appendChild(script);
    })
    const result = this.contentFile?.clone() || null;
    if (result) {
      result.contents = Buffer.from(document.querySelector('html').outerHTML);
    }
    return result
  }

  private async generatePage(markdown: Vinyl): Promise<Vinyl> {
    const renderer = new marked.Renderer();
    const primaryRenderCode = renderer.code;
    renderer.code = this.generateCode(markdown, primaryRenderCode.bind(renderer));
    const result = await marked(markdown.contents!.toString(), { renderer: renderer, gfm: true, breaks: true });
    const file = markdown
    file.contents = Buffer.from(result)
    file.extname = '.html'
    return file
  }

  private async generateSummary(markdown: Vinyl): Promise<Vinyl> {
    const result = await marked(markdown.contents!.toString());
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
    const file = markdown
    file.contents = Buffer.from(summary.outerHTML)
    file.extname = ''
    return file
  }

  private generateCode(markdown: Vinyl, primaryRenderCode): Function {
    let index = 0;
    return (codeString: string, infostring: string = 'markup', escaped: string): string => {
      index++;
      const { codeType, isExecable, execType } = this.parseInfoString(infostring)
      // 渲染代码块
      let result = primaryRenderCode(codeString, codeType, escaped);
      // 记录infostring
      this.infoStrings.set(codeType, true)
      // 添加line-numbers
      result = result.replace('<pre>', `<pre class="line-numbers language-${codeType}">`);
      if (isExecable) {
        const containerId = markdown.stem + '_' + index;
        const container = `<div id="${containerId}"></div>`;
        const code: ICode = {
          origin: markdown,
          containerId: containerId,
          type: execType,
          value: codeString.replace('$CONTAINER_ID', `'${containerId}'`), // 替换占位符$CONTAINER_ID
        }
        if (!this.execCodes.has(execType)) {
          this.execCodes.set(execType, [])
        }
        this.execCodes.get(execType)!.push(code)
        // 包裹codeblock容器
        result = this.wrapCodeBlock(container, result);
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
    const codeType = args[0].toLowerCase().trim();
    const execString = args[1] || '';
    const isExecable = execString.indexOf('exec') > -1; // todo 硬编码先
    const execType = execString.split('=')[1] || 'default';
    return {
      codeType: codeType,
      isExecable: isExecable,
      execType: execType
    }
  }

  /**
   * 为可执行区域组装结构
   */
  private wrapCodeBlock(execBlock, codeBlock): string {
    return `<div class="docp-block">
      <div class="docp-exec-block">${execBlock}</div>
      <div class="docp-code-block">
        ${codeBlock}
      </div>
      <a class="docp-control-block"></a>
    </div>
    `;
  }
}
