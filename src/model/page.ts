import Vinyl from 'vinyl';
import marked from 'marked';
import { JSDOM } from "jsdom";
import docpConfig from './docp-config';
import path from 'path';
import fs from 'fs';
import { getHightlightComponentByType } from '../utils';

export enum PAGE_TYPE {
  SUMMARY,
  CONTENT
}

export default class Page {
  static globalSummaryFile: Vinyl | null = null
  contentFile: Vinyl | null = null
  infoStrings: Map<string, boolean> = new Map()
  type = PAGE_TYPE.CONTENT
  execCodes: Array<ExecableCode> = []
  template: string = fs.readFileSync(path.resolve(docpConfig.template)).toString();
  DOMInstance = new JSDOM(this.template).window.document;

  generate(markdownFile: Vinyl) {
    if (markdownFile.stem.toUpperCase() === 'SUMMARY') {
      Page.globalSummaryFile = this.generateSummary(markdownFile);
      this.type = PAGE_TYPE.SUMMARY;
      return;
    }
    this.contentFile = this.generatePage(markdownFile);
  }

  outputHTML(): Vinyl {
    const commonScripts = docpConfig.scripts;
    const commonStyles = docpConfig.styles;

    // 添加内容
    const contentContainer = this.DOMInstance.querySelector('#docp-content');
    const menuContainer = this.DOMInstance.querySelector('#docp-menu');
    const headerContainer = this.DOMInstance.querySelector('#docp-header');
    contentContainer.innerHTML = this.contentFile!.contents!.toString();
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
        /**
         * highlight menu item
         * hrefName: helloworld.html -> helloworld
         * contentFile.stem: helloworld.md -> helloworld
         */
        const hrefName = list[i].href.split('.')[0];
        if (decodeURIComponent(hrefName) === decodeURIComponent(this.contentFile!.stem)) {
          list[i].classList.add('current');
        }
      }
      menuContainer?.appendChild(root);
    } else {
      // 无目录内容居中
      contentContainer.style = 'margin: 0 auto;';
      menuContainer?.remove();
    }

    // 处理 header信息
    const header = docpConfig.header;
    let logoInfo = '';
    if (header.logo) {
      const img = `<img class="docp-logo" src="${header.logo}"/>`;
      logoInfo = logoInfo + img;
    }
    if (header.name) {
      const name = `<div class="docp-name">${header.name}</div>`;
      logoInfo = logoInfo + name;
    }
    if (logoInfo.length > 0) {
      headerContainer.innerHTML = `<div class="docp-logo-wrapper">${logoInfo}</div>`;
    }
    if (docpConfig.header.navigation) {
      const navigation = this.DOMInstance.createElement('div');
      navigation.className = 'docp-nav';
      docpConfig.header.navigation.forEach(nav => {
        const link = this.DOMInstance.createElement('a');
        link.textContent = nav.value;
        link.href = nav.href;
        link.target = nav.target || '';
        navigation.appendChild(link);
      });
      headerContainer?.appendChild(navigation);
    }

    if (headerContainer?.childElementCount === 0) {
      headerContainer?.remove();
    }
    // 插入css样式
    this.addExternalStyles(commonStyles);
    // 插入js外链
    this.addExternalScripts(commonScripts)
    // 插入高亮代码
    this.infoStrings.forEach((value, key) => {
      const hl = getHightlightComponentByType(key)
      if (hl) {
        this.addExternalScripts(hl)
      }
    })
    const result = this.contentFile!.clone();
    result.contents = Buffer.from(this.DOMInstance.documentElement.outerHTML);
    return result;
  }

  addExternalScripts(src: Array<string> | string) {
    if (!Array.isArray(src)) {
      src = [src]
    }
    for (let i = 0; i < src.length; i++) {
      const script = this.DOMInstance.createElement('script');
      script.src = src[i];
      this.DOMInstance.head.appendChild(script);
    }
  }

  addInlineScripts(value: Array<string> | string) {
    if (!Array.isArray(value)) {
      value = [value]
    }
    for (let i = 0; i < value.length; i++) {
      const script = this.DOMInstance.createElement('script');
      script.innerHTML = value[i];
      this.DOMInstance.head.appendChild(script);
    }
  }

  addExternalStyles(src: Array<string> | string) {
    if (!Array.isArray(src)) {
      src = [src]
    }
    for (let i = 0; i < src.length; i++) {
      const link = this.DOMInstance.createElement('link');
      link.rel = 'stylesheet';
      link.href = link[i];
      this.DOMInstance.head.appendChild(link);
    }
  }

  addInlineStyles(value: Array<string> | string) {
    if (!Array.isArray(value)) {
      value = [value]
    }
    for (let i = 0; i < value.length; i++) {
      const style = this.DOMInstance.createElement('style');
      style.innerHTML = value[i];
      this.DOMInstance.head.appendChild(style);
    }
  }

  private generatePage(markdown: Vinyl) {
    const renderer = new marked.Renderer();
    const primaryRenderCode = renderer.code;
    renderer.code = this.generateCode(markdown, primaryRenderCode.bind(renderer));
    const options = Object.assign({}, docpConfig.marked, { renderer: renderer });
    const contents = markdown.contents!.toString();
    const result = marked(contents, options);
    const file = markdown;
    file.contents = Buffer.from(result);
    file.extname = '.html';
    return file;
  }

  private generateSummary(markdown: Vinyl) {
    const result = marked(markdown.contents!.toString(), docpConfig.marked);
    const templateDOM = new JSDOM(result);
    const summary = templateDOM.window.document.querySelector('ul');
    if (!summary) {
      return null;
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
      const { codeType, execType, showExecCode, unfoldExecCode } = this.parseInfoString(infostring);
      // 渲染代码块
      let result = primaryRenderCode(codeString, codeType, escaped);
      // 记录infostring，插入hightlight代码
      this.infoStrings.set(codeType, true);
      // 添加line-numbers
      result = result.replace('<pre>', `<pre class="line-numbers language-${codeType}">`);
      if (execType) {
        const containerId = markdown.stem + '_' + index;
        const container = `<div id="${containerId}"></div>`;
        result = this.wrapCodeBlock(container, result, showExecCode, unfoldExecCode);
        const code: ExecableCode = {
          containerId: containerId,
          type: execType,
          codeBlockString: result,
          value: codeString.replace('$CONTAINER_ID', `'${containerId}'`), // 替换占位符$CONTAINER_ID
        };
        this.execCodes.push(code);
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
    let codeType = '';
    let execType = '';
    let showExecCode: boolean = docpConfig.showExecCode;
    let unfoldExecCode: boolean = docpConfig.unfoldExecCode;
    args.forEach((item, index) => {
      if (index === 0) {
        codeType = item.toLowerCase().trim();
        return;
      }
      // 可执行
      if (item.startsWith('exec')) {
        execType = (item.split('=')[1] || 'javascript').trim();
        return;
      }
      // 可展示代码块
      if (item.startsWith('show')) {
        showExecCode = item.split('=')[1] === 'false' ? false : true;
        return;
      }
      // 默认展开代码块
      if (item.startsWith('unfold')) {
        unfoldExecCode = item.split('=')[1] === 'false' ? false : true;
      }
    });
    return {
      codeType,
      execType,
      showExecCode,
      unfoldExecCode
    };
  }

  /**
   * 为可执行区域组装结构
   */
  private wrapCodeBlock(execBlock, codeBlock, showExecCode, unfoldExecCode): string {
    let result = `<div class="docp-block">
      <div class="docp-exec-block">${execBlock}</div>
        {{codeBlock}}
        {{controlBlock}}
      </div>
    `;
    const codeBlockString = showExecCode ? `<div class="docp-code-block ${unfoldExecCode ? 'show' : ''}">${codeBlock}</div>` : '';
    const controlBlockString = showExecCode ? `<div class="docp-control-block ${unfoldExecCode ? 'active' : ''}"></div>` : '';
    result = result.replace('{{codeBlock}}', codeBlockString);
    result = result.replace('{{controlBlock}}', controlBlockString);
    return result;
  }
}
