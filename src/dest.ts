// fs-extra can`t fit memfs
import fs2 from './fs2';
import through2 from 'through2';

export default function (destPath: string) {
  return through2.obj(function (file, enc, callback) {
    if (file.extname !== '.html') {
      return callback()
    }
    fs2.mkdirSync(destPath, { recursive: true })
    const htmlPath = destPath + '/' + file?.basename;
    fs2.writeFileSync(htmlPath, file.contents.toString());
    this.push(file);
    callback();
  });
};