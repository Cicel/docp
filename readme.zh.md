# Docp

`Docp`是一个将markdown转换为Web的工具，类似[gitbook](https://www.gitbook.com/)和[vuepress](https://github.com/vuejs/vuepress)。与他们不同的是`Docp`提供了一种机制可以执行代码块中的代码。这将为你的文档站点提供极强的变现力！

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



### 输出Web站点

文档编写完成后，可以编译成静态Web站点并输出到`outDir`指定的目录下，命令如下：

```shell
$ docp build
```

默认的输出目录是`docsite`，你也可以自定义。



## 执行javascript

本章介绍`Docp`的核心能力：执行javascript。先看一个简单的例子：

```markdown
# A markdown demo

Hello there,build this file and you will get a alert

​```javascript --exec
alert("Hello World")
​```
```

我们在代码块的`infostring`上添加了标识：`--exec`。默认情况下`Docp`借助浏览器js引擎直接执行该段代码，因此你会看见一个hello world弹窗。



你可以在代码块中使用各种DSL，比如React、Vue，但这需要预编译支持。Docp提供了一系列plugin，帮助你编译主流的DSL语法。你也可以自己编写plugin。



#### 使用React

首先引入plugin

```javascript
// docp.config.js
module.exports = {
	...
  "plugins": {
    "react": "@docp/plugin-react"
  }
}
```

修改--exec的类型：`--exec=react`

注意这里的exec类型要与plugin中的key对应。也就是说，Docp在读取到plugin配置时，执行“使用@docp/plugin-react来对react进行预处理”的逻辑。

```markdown
# A markdown demo

Hello there,build this file and you will get a alert

​```javascript --exec=react
import React from 'react'
import ReactDOM from 'react-dom'
class Welcome extends React.Component {
  render() {
    return <a>Hello World</a>;
  }
}
ReactDOM.render(<Welcome/>, document.getElementById($CONTAINER_ID))
​```
```



#### $CONTAINER_ID

在上面的例子中，我们把`<Welcome/>`渲染在了`$CONTAINER_ID`上。`$CONTAINER_ID`表示当前代码块的上一级兄弟元素，方便你可以在页面上展示一些元素。



## 实现一个plugin

plugin本质上是一个函数，接受当前类型代码块的所有内容，输出可执行javascript。我们以[flowchart](https://flowchart.js.org/)为例，展示如何在markdown中显示流程图。

```javascript
/**
 * flowchart.plugin.js
 * codes: array include all codes whitch has --exec type of flowchart.
 * callback: function whitch will execute after plugin done.
 */
module.exports = function (codes, callback) {

  // Define inlineSources and externalSources flowchart needed
  const inlineSources = []
  const externalSources = ['https://cdn.bootcdn.net/ajax/libs/raphael/2.3.0/raphael.js', 'https://cdn.bootcdn.net/ajax/libs/flowchart/1.13.0/flowchart.js']

  // flowchart options
  const options = `var options = {
    'x': 0,
    'y': 0,
    'line-width': 3,
  }`

  /**
   * push options to inlineSources thus
   * each page include flowchart will has this options
   */
  inlineSources.push(options)

  /**
   * loop codes and append extra logic.
   */
  codes.forEach((code) => {
    const { containerId, value } = code
    inlineValue = value.replace('\n', '')
    const inlineSource = `var diagram = flowchart.parse(\`${value}\`);
    diagram.drawSVG("${containerId}", options);`
    inlineSources.push(inlineSource)
  })

  /**
   * docp will append inlineSources as inline scripts
   * and externalSources as external scripts to page
   * whitch has --exec type of flowchart
   */
  callback({
    inlineSources,
    externalSources
  })
}
```

参数说明：

- codes： 所有flowchart类型的代码块，数组类型，每个代码块包含`containerId`和`value`两个属性。
- callback：处理完成后的回调函数，接受object作为参数。其中inlineSources会插入到script标签中，externalSources会以src形式引用。



配置plugins：

```javascript
// docp.config.js
module.exports = {
	...
  "plugins": {
    "flowchart": "./flowchart.js" // 本地相对路径
  }
}
```

最后在markdown中关联flowchart

```javascript --exec=flowchart --show
st=>start: Start:>http://www.google.com[blank]
e=>end:>http://www.baidu.com
op1=>operation: My Operation
sub1=>subroutine: My Subroutine
cond=>condition: Yes
or No?:>http://www.google.com
io=>inputoutput: catch something...
para=>parallel: parallel tasks
st->op1->cond
cond(yes)->io->e
cond(no)->para
para(path1, bottom)->sub1(right)->op1
para(path2, top)->op1
```

