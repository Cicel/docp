# 介绍

`Docp`是一个将markdown转换为Web的工具，类似[gitbook](https://www.gitbook.com/)和[vuepress](https://github.com/vuejs/vuepress)。与他们不同的是`Docp`提供了一种机制可以执行代码块中的代码。这将为你的文档站点提供极强的变现力！



## 安装

```shell
$ npm install docp -g
```

> 依赖 node.js 10 及以上版本



## 快速开始

`Docp`是开箱即用的。指明需要预览的文件或目录，执行如下命令即可：

```shell
# 预览当前目录下所有markdown

$ docp dev --rootDir ./

# 预览当前目录下helloworld.md

$ docp dev --file ./helloworld.md

```

`Docp`将在本地启动一个服务器，如下所示，点击链接即可预览。



![](http://img.tanghb.cn/dev.jpg)



点击链接即可预览。



### 使用配置文件

在上述的例子中，我们通过`--rootDir`指定文档所在目录。你也可以通过配置文件实现相同效果。

`Docp`提供了创建配置文件的命令：

```shell
$ docp init
```

该命令会在当前目录下创建`docp.config.js`文件，具备字段：

```javascript
module.exports = {
  "rootDir": "./",
  "outDir": "./docsite",
  "template": "~/template/article.html",
  "plugins": {}
}
```

**字段说明：**

- rootDir: markdown文件所在目录

- outDir: 编译产物的输出目录

- template: html模板，Docp内置了一个简单模板，你可以替换它

- plugins: 为`Docp`提供处理代码块中代码的能力，后面详细介绍



## 输出Web站点

文档编写完成后，可以编译成静态Web站点并输出到`outDir`指定的目录下，命令如下：

```shell
$ docp build
```

默认的输出目录是`docsite`，你也可以自定义。