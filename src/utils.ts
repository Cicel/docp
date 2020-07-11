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