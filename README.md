# Docp

Docp is a documentation tool that compiles markdown to a  website. It provides the ability to execute JavaScript which write in markdown. That means  you can preview any JavaScript even React or Vue！

[Document](https://cicel.github.io/docp/en/introduction.html) | [中文文档](https://cicel.github.io/docp/zh-cn/introduction.html)

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



### Output website

After you complete your document, use the following command to compile markdowns to website and output to dir you specified by `outDir`.

```shell
$ docp build
```

The default dir is `./docsite`.



## Execute javascript

In this section, we describe the core ability of `Docp`: Execute javascript. First look at a simple example.

```markdown
<!--- helloworld.md -->
# A markdown demo

Hello there,build this file and you will get a alert

​```javascript --exec
alert("Hello World")
​```
```

Notice that we add a flag named `--exec` on `infostring`. `Docp` will execute inner code with the help of browser`s js engine by default. So you will see a alert popup.



For DSLs like React/Vue, you need plugin to preprocessing it. Docp provides several plugins including React, Let`s have look how it works.



### Use React

First of all, Include React plugin in `docp.config.js`

```javascript
// docp.config.js
module.exports = {
	...
  "plugins": {
    "react": "@docp/plugin-react"
  }
}
```

Then, add the React code and change the type of `--exec` to react.

Notice that `--exec` type essentially equal to plugin`s key.

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



### $CONTAINER_ID

`$CONTAINER_ID` is macro definition that convenient for you to get the container of the current code block, You can render anything you want.



## Creating a plugin

plugin is essentially a function that input is code block`s inner code and output is execable javascript. We use [flowchart](https://flowchart.js.org/) as an example to show how to display the flowchart in markdown.

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



Then config the plugin:

```javascript
// docp.config.js
module.exports = {
	...
  "plugins": {
    "flowchart": "./flowchart.plugin.js" // 本地相对路径
  }
}
```



Finally, associate exec type in markdown

```markdown
​```javascript --exec=flowchart
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
​```
```


![](http://img.tanghb.cn/20200706192720.jpg)

