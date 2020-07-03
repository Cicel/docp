import path from 'path';
import fs from 'fs-extra';
import through2 from 'through2';
import { printLog } from './utils';

export default function (destPath: string) {
  const outputPath = path.resolve(destPath);
  return through2.obj(function (file, enc, callback) {
    const htmlPath = outputPath + '/' + file?.stem + '.html';
    fs.outputFileSync(htmlPath, file.contents.toString());
    callback();
  }, function (callback) {
    fs.copySync(path.resolve(__dirname, '../template/assets'), outputPath + '/assets');
    printLog.success('website generated at: ' + outputPath);
    callback();
  });
};
