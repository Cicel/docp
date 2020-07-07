import through2 from 'through2';
import Vinyl from 'vinyl';
import docpConfig from './model/docp-config';

export default function () {
  const result: Array<Vinyl> = [];
  return through2.obj(function (file, enc, callback) {
    if (file.extname !== '.md') {
      return callback();
    }
    if (file.basename === docpConfig.summary) {
      result.unshift(file);
      return callback();
    }
    result.push(file);
    callback();
  }, function (callback) {
    result.forEach(item => {
      this.push(item);
    });
    callback();
  });
}
