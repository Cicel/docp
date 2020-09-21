# Page configuration



## Table of contents

Table of contents is optional and represented by `SUMMARY.md`  as same as gitbook. A typical directory structure is as follows:

```markdown
# Summary

* [Introduction](README.md)
* [Structure](book/README.md)
   * [Readme and summary](book/file.md)
   * [Initialize directory](book/prjinit.md)
* [Output](output/README.md)
   * [Static website](output/outfile.md)
   * [PDF support](output/pdfandebook.md)
* [Publish](publish/README.md)
   * [Publish to github pages](publish/gitpages.md)
* [Conclusion](end/README.md)
```



# Header

Header is optional too. Represented by `header` fields. You can customize the content of logo, name and navigation. If you want to customize the style of header, use [custom template](custom-template.html)

```javascript
module.exports = {
	header: {
		name: 'your project name',
		logo: 'your project logo',
		navigation: [{
			value: 'nav value',
			href: 'same as <a> href',
			target: 'same as <a> target'
		}]
	}
}
```



