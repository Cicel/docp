import http from 'http';
import url from 'url';
import path from 'path';
import mime from 'mime';
import docpConfig from './model/docp-config';
import { printLog } from './utils';
import fs2 from './fs2';

export default function () {
  const server = http.createServer(function (req: any, res) {
    const urlObj: any = url.parse(req.url);
    const urlPathname = decodeURI(urlObj.pathname);
    // 判断路径是否有后缀, 有的话则说明客户端要请求的是一个文件
    const ext = path.parse(urlPathname).ext;
    const mimeType = mime.getType(ext);
    const htmlPath = docpConfig.virtualDir + urlPathname;
    const assetPath = path.resolve(__dirname, '../template') + urlPathname;
    const filePath = fs2.existsSync(htmlPath) ? htmlPath : assetPath;
    // 读取静态文件
    try {
      const data = fs2.readFileSync(filePath);
      res.writeHead(200, { "Content-Type": mimeType, 'Cache-Control': 'max-age=86400' });
      res.write(data);
    } catch (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.write("404 - NOT FOUND \n" + "MSG: " + err.message);
    } finally {
      setTimeout(() => {
        res.end();
      }, 1000)
    }
  });
  server.listen(Number(docpConfig.port), '127.0.0.1', function () {
    printLog.info('server start');
  });
}