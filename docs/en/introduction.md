# Introduction

Docp is a documentation tool that compiles markdown to a  website. It provides the ability to execute JavaScript which write in markdown. That means  you can preview any JavaScript even React or Vue！

## Install

```shell
$ npm install docp -g
```

> node.js 10 or later needed


## Quick Start

`Docp` is out of box. Specify the markdown file or directory and execute the following command:

```shell
# compile and preview current dir`s markdowns
$ docp dev --rootDir ./

# compile and preview helloworld.md
$ docp dev --file ./helloworld.md
```

There will start a server locally and print page`s url.

![](http://img.tanghb.cn/dev.jpg)



### config file

We specify the root dir through `--rootDir` before. Of course, you can also use a configuration file named `docp.config.js` to achieve the same effect.

Use the following command or manually create it.

```shell
$ docp init
```

 `docp.config.js` includes the same fields as cli options.

```javascript
// docp.config.js
module.exports = {
  "rootDir": "./",
  "outDir": "./docsite",
  "template": "~/template/article.html",
  "plugins": {}
}
```

**Fields description:**

- rootDir: Root directory of input files. Default to current directory.
- outDir: Directory for output files. Default to ./docsite.
- template: HTML template. Default to built-in template. You can replace it by change the template path.
- plugins: The plugins docp use to process codes.



## Output website

After you complete your document, use the following command to compile markdowns to website and output to dir you specified by `outDir`.

```shell
$ docp build
```

The default dir is `./docsite`.