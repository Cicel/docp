import path from 'path';
import colors from 'colors';

/**
* 按需加载codeblock高亮插件
*/
export const getHightlightComponentByType = (type: string) => {
  //按需插入prim高亮组件
  const types = ['bash', 'c', 'cpp', 'csharp', 'dart', 'diff', 'docker',
    'git', 'go', 'graphql', 'java', 'json', 'jsx', 'kotlin', 'markdown',
    'nginx', 'objectivec', 'php', 'powershell', 'python', 'ruby', 'sql',
    'swift', 'typescript', 'wasm'];
  const lowerType = type.toLowerCase();
  if (types.indexOf(lowerType) > -1) {
    return `assets/prism-${lowerType}.min.js`;
  }
  return null;
};

export const copyFolderRecursiveSync = (source, targetFolder, fs) => {
  let files: Array<string> = [];
  //check if folder needs to be created or integrated
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder);
  }

  //copy
  if (fs.lstatSync(source).isDirectory()) {
    files = fs.readdirSync(source);
    files.forEach(function (file) {
      const curSource = path.join(source, file);
      if (fs.lstatSync(curSource).isDirectory()) {
        copyFolderRecursiveSync(curSource, targetFolder, fs);
      } else {
        copyFileSync(curSource, targetFolder);
      }
    });
  }

  function copyFileSync(source, target) {
    let targetFile = target;
    //if target is a directory a new file with the same name will be created
    if (fs.existsSync(target)) {
      if (fs.lstatSync(target).isDirectory()) {
        targetFile = path.join(target, path.basename(source));
      }
    }

    fs.writeFileSync(targetFile, fs.readFileSync(source));
  }
};

export const printLog = {
  info: (msg: string) => {
    const color = colors.cyan;
    const tag = '[info]';
    console.log(tag, color(msg));
  },
  success: (msg: string) => {
    const color = colors.green;
    const tag = '[success]';
    console.log(tag, color(msg));
  },
  warn: (msg: string) => {
    const color = colors.yellow;
    const tag = '[warinig]';
    console.log(tag, color(msg));
  },
  error: (msg: string) => {
    const color = colors.red;
    const tag = '[error]';
    console.log(tag, color(msg));
  }
};