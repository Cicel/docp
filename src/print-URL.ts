import through2 from 'through2';
import { printLog } from './utils';
import docpConfig from './model/docp-config';

export default function () {
  return through2.obj(function (file, enc, callback) {
    printLog.info('page at http://127.0.0.1:' + docpConfig.port + '/' + file.stem + '.html');
    callback();
  });
};