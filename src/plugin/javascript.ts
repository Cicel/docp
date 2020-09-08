import through2 from 'through2';
import Page from '../model/page';
import { JSDOM } from "jsdom";

export default function (options) {
  const pages: Array<Page> = [];
  return through2.obj(function (obj, enc, callback) {
    const { page, execCode = {} } = obj;
    const { type, value, containerId } = execCode;
    if (!page || !type || type !== 'javascript') {
      this.push(obj);
      return callback();
    }
    const contentString = page.contentFile.contents.toString();
    const document = new JSDOM(contentString).window.document;
    const wrapper = document.querySelector('#' + containerId);
    const iframe = document.createElement('iframe');
    iframe.setAttribute('srcdoc', value);
    wrapper.appendChild(iframe);
    if (pages.indexOf(page) === -1) {
      const style = document.createElement('style');
      style.innerHTML = 'iframe {width: 100%; border: none;}';
      document.head.appendChild(style);
      pages.push(page);
    }
    page.contentFile.contents = Buffer.from(document.documentElement.outerHTML);
    callback();
  }, function (callback) {
    for (let i = 0; i < pages.length; i++) {
      this.push(pages[i].outputHTML());
    }
    callback();
  });
}