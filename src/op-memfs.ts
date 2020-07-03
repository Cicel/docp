import { vol } from 'memfs';
import { copyFolderRecursiveSync } from './utils';
import fs from 'fs';
import path from 'path';
import { ufs } from 'unionfs';

const newFS = ufs.use(fs).use(vol as any);

export function getMemPath() {
  return '/dist/'
}

export function output2Mem(fileName, fileContent) {
  const filePath = getMemPath() + fileName
  vol.fromJSON({
    [filePath]: fileContent
  });
}

export function getFileFromMem(pathString, callback) {
  const realPath = getMemPath() + pathString
  vol.readFile(realPath, callback)
}

export function copyAssetsToDist() {
  copyFolderRecursiveSync(path.resolve(__dirname, '../template/assets'), getMemPath() + 'assets', newFS);
}