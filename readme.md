[![Build Status](https://travis-ci.org/xueye/clayman.svg)](https://travis-ci.org/xueye/clayman)

# Clayman
A CSS diff tool to take a base styesheet and theme stylesheet and remove the redundancies from the theme

Clayman is _very_ much in alpha right now.

## Install
> npm install clayman --save-dev

## Reading Documentation
```
$ git clone git@github.com:xueye/clayman.git
$ open clayman/doc/index.html
```

## Usage
```
var fs = require('fs'),
    path = require('path'),
    clayman = require("clayman");

var source1 = fs.readFileSync(path.join(__dirname, 'simple-style.css')).toString();

var source2 = fs.readFileSync(path.join(__dirname, 'simple-style-2.css')).toString();

var result = clayman.difference(source1, source2);
console.log(result.toString());
```

## ToDo:

* command line arguments
* Create build tools
  * gulp-clayman
  * grunt-clayman
* much more extensive testing
* Fix how media queries are handled
* Get postcss working with typescript
* Publish .d.ts
* Upload documentation and host example website
* Bootstrap example
* Bootstrap theme website
* Add more features
  * Allow you to interface with Clayman using filepaths, not just strings
  * Allow you to parse LESS and SASS