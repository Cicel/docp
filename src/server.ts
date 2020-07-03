import http from 'http';
import url from 'url';
import path from 'path';
import mime from 'mime';
import docpConfig from './model/docp-config';
import { printLog } from './utils';
import { getFileFromMem } from './op-memfs';

export default function () {
  const server = http.createServer(function (req: any, res) {
    const urlObj: any = url.parse(req.url);
    const urlPathname = decodeURI(urlObj.pathname);
    // 判断路径是否有后缀, 有的话则说明客户端要请求的是一个文件
    const ext = path.parse(urlPathname).ext;
    const mimeType = mime.getType(ext);
    if (!ext) {
      // 返回 false 表示, 客户端想要的 不是 静态文件
      res.end();
    }
    // 读取静态文件
    getFileFromMem(urlPathname, (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.write("404 - NOT FOUND");
        res.end();
      } else {
        res.writeHead(200, { "Content-Type": mimeType });
        res.write(data);
        res.end();
      }
    })
  });

  server.listen(Number(docpConfig.port), '127.0.0.1', function () {
    printLog.info('server start');
  });
}