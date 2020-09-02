# 实现一个plugin

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
