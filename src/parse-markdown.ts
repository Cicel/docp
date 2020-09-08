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

export default function () {
  return through2.obj(async function (file: Vinyl, enc: string, callback: Function) {
    const page = new Page();
    page.generate(file);
    printLog.success(`compile ${file.basename} done `);

    if (page.type === PAGE_TYPE.SUMMARY) {
      return callback();
    }

    if (page.execCodes.length === 0) {
      const html = page.outputHTML();
      this.push(html);
      return callback();
    }

    for (let i = 0; i < page.execCodes.length; i++) {
      this.push({ page, execCode: page.execCodes[i] })
    }
    callback()
  })
}