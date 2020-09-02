// fs-extra can`t fit memfs
import fs from 'fs';
import through2 from 'through2';
import mkdirp from 'mkdirp';

export default function (destPath: string) {
  return through2.obj(function (file, enc, callback) {
    if (file.extname !== '.html') {
      return callback()
    }
    mkdirp(destPath).then(() => {
      const htmlPath = destPath + '/' + file?.basename;
      fs.writeFileSync(htmlPath, file.contents.toString());
      this.push(file);
      callback();
    })
  });
};