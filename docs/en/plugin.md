# Create a plugin

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