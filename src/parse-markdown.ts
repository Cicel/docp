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
import Page, { PAGT_TYPE } from './model/page';
import { docpConfig } from './model/docp-config';

const doneFunctions: Array<any> = [];

export default function () {
  return through2.obj(async function (file: Vinyl, enc: string, callback: Function) {
    if (file.extname !== '.md') {
      return callback();
    }
    const page = new Page();
    await page.generate(file);
    printLog.success(`compile ${file.basename} done `);

    if (page.type === PAGT_TYPE.SUMMARY) {
      return callback();
    }

    // 遍历transformFunctions
    const iterator = page.execCodes.entries();
    const walker = async (iterator) => {
      const item = iterator.next();
      if (item.done) {
        const html = await page.outputHTML();
        this.push(html);
        return callback();
      }
      const preset = getPresetByType(item.value[0]);
      // 暂存done callback，flush时调用
      if (preset.done) {
        doneFunctions.push({ page: page, done: preset.done });
      }
      preset.transform(item.value[1], (result: any = {}) => {
        page.inlineSources = result.inlineSources || [];
        page.externalSources = result.externalSources || [];
        walker(iterator);
      });
    };
    walker(iterator);

  }, function (callback) {
    // 遍历doneFunctions
    const iterator = doneFunctions.values();
    const walker = (iterator) => {
      const item = iterator.next();
      if (item.done) {
        return callback()
      }
      const page = item.value.page;
      const done = item.value.done;
      done(async (result: any = {}) => {
        page.inlineSources = result.inlineSources || [];
        page.externalSources = result.externalSources || [];
        const html = await page.outputHTML();
        this.push(html);
        walker(iterator);
      });
    };
    walker(iterator);
  });
}

function getPresetByType(type) {
  const preset = docpConfig.presets[type];
  if (!preset) {
    printLog.error(`preset of ${type} not defined`);
    process.exit(0);
  }
  if (typeof preset === 'function') {
    return {
      transform: preset,
      done: null
    };
  }
  if (typeof preset.transform !== 'function') {
    printLog.error(`preset of ${type} must contain transform function`)
    process.exit(0)
  }
  const transform = preset.transform;
  const done = preset.done || null;
  return {
    transform,
    done
  };
}