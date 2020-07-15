# Execute javascript

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



## Use React

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

> Notice ⚠️
>
>`$CONTAINER_ID` is macro definition that convenient for you to get the container of the current code block, You can render anything you want.


