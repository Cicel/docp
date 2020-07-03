import { printLog } from './utils';
import through2 from 'through2';
import { output2Mem, copyAssetsToDist } from './op-memfs';
import docpConfig from './model/docp-config';

export default function () {
  return through2.obj(function (file, enc, callback) {
    // todo 输出到dist目录
    output2Mem(file.stem + '.html', file.contents.toString());
    printLog.info('page at http://127.0.0.1:' + docpConfig.port + '/' + file.stem + '.html');
    callback();
  }, function (callback) {
    copyAssetsToDist()
    callback();
  });
}
