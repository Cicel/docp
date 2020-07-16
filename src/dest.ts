import path from 'path';
// fs-extra can`t fit memfs
import fs from 'fs';
import through2 from 'through2';
import mkdirp from 'mkdirp';

export default function (destPath: string) {
  const outputPath = path.resolve(destPath);
  return through2.obj(function (file, enc, callback) {
    mkdirp(outputPath).then(() => {
      const htmlPath = outputPath + '/' + file?.stem + '.html';
      fs.writeFileSync(htmlPath, file.contents.toString());
      this.push(file);
      callback();
    })
  });
};