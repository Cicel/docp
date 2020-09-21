# Quick start

`Docp` is easy to use. 



## Preview

Run `docp serve` to preview website locally.

```shell
# serve a file
$ docp serve --file helloworld.md
# serve a directory
$ docp serve --rootDir ./
# get options from configuration file
$ docp serve
```

> `--file` specify the file to serve. The whole doc is [here](options.html)
>
> `--rootDir` specify the directory to serve.

Also you can use a configuration file, will be introduced later.



## Generate website

Run `docp build` to output website to dist path. Default to `./docsite`.

```shell
# output website to ./docsite
$ docp build
# output website to ./dist
$ docp build --ourDir ./dist
```

> `--ourDir` specify the output directory.



## Configuration file

The configuration file named  `docp.config.js`. It`s not necessary but provides more convenience. Created by following command or manually:

```shell
$ docp init
```

The structure:

```javascript
module.exports = {
  rootDir: './docs', // directory of markdown files
  outDir: './docsite', // directory of output files
  plugins: {}
}
```

