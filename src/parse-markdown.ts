/**
 * input markdown files
 * output
 *  1. has exec code, return code files as Vinyl
 *  2. has summary, return summary as DOM
 *  3. return html files as Vinyl which compiled from markdown
 */
import through2 from 'through2';
import Vinyl from 'vinyl';
import { printLog } from './utils';
import Page, { PAGE_TYPE } from './model/page';
import docpConfig from './model/docp-config';
import path from 'path';

const doneFunctions: Array<any> = [];
export default function () {
  return through2.obj(async function (file: Vinyl, enc: string, callback: Function) {
    const page = new Page();
    await page.generate(file);
    printLog.success(`compile ${file.basename} done `);

    if (page.type === PAGE_TYPE.SUMMARY) {
      return callback();
    }

    // page输出html，如存在execCodes，暂存到doneFunctions
    const iterator = page.execCodes.entries();
    const walker = async (it) => {
      const item = it.next();
      if (item.done) {
        const html = await page.outputHTML();
        this.push(html);
        return callback();
      }
      const plugin = getPluginByType(item.value[0]);
      // 暂存done callback，flush时调用
      if (plugin.done) {
        doneFunctions.push({ page: page, done: plugin.done });
      }
      plugin.transform(item.value[1], plugin.options, (result: any = {}) => {
        page.inlineSources = result.inlineSources || [];
        page.externalSources = result.externalSources || [];
        walker(it);
      });
    };
    walker(iterator);

  }, function (callback) {
    // 遍历doneFunctions
    const iterator = doneFunctions.values();
    const walker = (it) => {
      const item = it.next();
      if (item.done) {
        return callback();
      }
      const page = item.value.page;
      const done = item.value.done;
      done(async (result: any = {}) => {
        page.inlineSources = result.inlineSources || [];
        page.externalSources = result.externalSources || [];
        const html = await page.outputHTML();
        this.push(html);
        walker(it);
      });
    };
    walker(iterator);
  });
}

function getPluginByType(type) {
  const plugin = docpConfig.plugins[type];
  if (!plugin) {
    printLog.error(`plugin of ${type} not defined`);
    process.exit(0)
  }
  let module: any = null
  let options = {}
  // 字符串直接require
  if (typeof plugin === 'string') {
    module = require(path.resolve(process.cwd(), plugin));
  }
  // 数组解析path和参数
  if (Array.isArray(plugin)) {
    module = require(path.resolve(process.cwd(), plugin[0]));
    options = plugin[1] || {}
  }
  if (typeof module === 'function') {
    return {
      transform: module,
      options: options,
      done: null
    };
  }
  if (typeof module.transform !== 'function') {
    printLog.error(`plugin of ${type} must contain transform function`);
  }
  const transform = module.transform;
  const done = module.done || null;
  return {
    transform,
    options,
    done
  };
}