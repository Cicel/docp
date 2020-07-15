# 执行javascript

本章介绍`Docp`的核心能力：执行javascript。先看一个简单的例子：

```markdown
# A markdown demo

Hello there,build this file and you will get a alert

​```javascript --exec
alert("Hello World")
​```
```

我们在代码块的`infostring`上添加了标识：`--exec`。默认情况下`Docp`借助浏览器js引擎直接执行该段代码，因此你会看见一个hello world弹窗。

你可以在代码块中使用各种DSL，比如React、Vue，但这需要预编译支持。Docp提供了一系列plugin，帮助你编译主流的DSL。你也可以自己编写plugin。



## 使用React

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

> 注意 ⚠️
>
> 在上面的例子中，我们把`<Welcome/>`渲染在了`$CONTAINER_ID`上。`$CONTAINER_ID`表示当前代码块的上一级兄弟元素，方便你可以在页面上展示一些元素。