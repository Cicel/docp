# Custom template

Any html file can be used to replace the internal template. Specify the new template first:

```javascript
module.exports = {
  rootDir: './docs', 
  outDir: './docsite', 
  plugins: {},
  template: 'new_template.html' // specify template file
}
```

Then implements the inject point.



## Inject point

Inject point is the DOM elements that has the specified id. `Docp` will insert compiled result into these elements.

**Header:**  `#docp-header`

**Table of contents:** `#docp-menu`

**Main contents:** `#docp-content`

