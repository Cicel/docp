import path from 'path';
import fs from 'fs';
import through2 from 'through2';

export default function (destPath: string) {
  const outputPath = path.resolve(destPath);
  return through2.obj(function (file, enc, callback) {
    const htmlPath = outputPath + '/' + file?.stem + '.html';
    fs.writeFileSync(htmlPath, file.contents.toString());
    this.push(file);
    callback();
  });
};