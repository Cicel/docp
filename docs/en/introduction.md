# Introduction

`Docp` is a documentation tool that compiles markdown to a  website. It provides the ability to execute JavaScript which write in markdown. That means  you can preview any JavaScript even React or Vue！

## Install

```shell
$ npm install docp -g
```

> node.js 10 or later needed



## Demo

```html --exec
<style>
.heart {
  width: 100px;
  height: 100px;
  background:url("https://cssanimation.rocks/images/posts/steps/heart.png");
  background-position: 0 0;
  cursor: pointer;
  transition: background-position 1s steps(28);
  transition-duration: 0s;
  margin: 0 auto;
}
.heart.is-active {
	transition-duration: 1s;
	background-position: -2800px 0;
}
</style>
<div class="heart"></div>
<script>
document.querySelector('.heart').addEventListener('click',function(e){
	const classList = e.target.classList
	if (classList.contains('is-active')) {
		classList.remove('is-active')
	} else {
		classList.add('is-active')
	}
})
</script>
```

Just add the flag `--exec` to infostring everything will be done. No private syntax.

```markdown
​```html --exec
# your javascript code here
​```
```

