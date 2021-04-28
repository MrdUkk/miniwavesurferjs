# [miniwavesurfer.js](https://wavesurfer-js.org)

Interactive navigable audio visualization using Canvas.

WARNING! ATTENTION! 
This is a CLONEd from original wavesurfer.js project. My goal  aimed to completely remove audio functionality (and all html5 audio), 
reducing maximally codesize and providing only visualizaton from externally already pre-computed peaks data.
All respects and credits should go to original authors! Without the original code this clone would not exist!

Added functionality is ability to draw peaks from various integer type arrays (not only float -1..+1) but
1byte, 2byte, 4bytes (int8_t, int16_t, int32_t, float).
to set maximum add in load(,, ) function 3rd parameter. (128/255/16384/...)

See original [tutorial](https://wavesurfer-js.org/docs) and [examples](https://wavesurfer-js.org/examples) on [wavesurfer-js.org](https://wavesurfer-js.org).
it is partially compatible with it. Except html audio and difference in load() function arguments.
so pay attention to examples/tutorials where audio is required!

## Browser support
wavesurfer.js works only in modern browsers.

## API in examples

Choose a container:
```html
<div id="waveform"></div>
```
Create an instance, passing the container selector and [options](https://wavesurfer-js.org/docs/options.html):

```javascript
var wavesurfer = WaveSurfer.create({
    container: '#waveform',
    waveColor: 'violet',
    progressColor: 'purple'
});
```

Subscribe to some [events](https://wavesurfer-js.org/docs/events.html):

```javascript
wavesurfer.on('ready', function () {
    wavesurfer.play();
});
```

Load an waveform:

```javascript
wavesurfer.load([ 0, 100, 45, 11, 202, 68, 240 ], 1, 255);
```

## Documentation

See the original documentation on all available [methods](https://wavesurfer-js.org/docs/methods.html), [options](https://wavesurfer-js.org/docs/options.html) and [events](https://wavesurfer-js.org/docs/events.html) on the [homepage](https://wavesurfer-js.org/docs/).


## Using with a module bundler

Install Wavesurfer:
```bash
npm install wavesurfer.js --save
# or
yarn add wavesurfer.js
```

Use it with a module system like this:
```javascript
// import
import WaveSurfer from 'wavesurfer.js';

// commonjs/requirejs
var WaveSurfer = require('wavesurfer.js');

// amd
define(['WaveSurfer'], function(WaveSurfer) {
  // ... code
});

```


Install development dependencies:

```
npm install
```
Development tasks automatically rebuild certain parts of the library when files are changed (`start` – wavesurfer, `start:plugins` – plugins). Start a dev task and go to `localhost:8080/example/` to test the current build.

Start development server for core library:

```
npm run start
```

Start development server for plugins:

```
npm run start:plugins
```

Build all the files. (generated files are placed in the `dist` directory.)

```
npm run build
```

Running tests only:

```
npm run test
```

Build documentation with esdoc (generated files are placed in the `doc` directory.)
```
npm run doc
```

If you want to use [the VS Code - Debugger for Chrome](https://github.com/Microsoft/vscode-chrome-debug), there is already a [launch.json](.vscode/launch.json) with a properly configured ``sourceMapPathOverrides`` for you.

## Editing documentation
The homepage and documentation files are maintained in the [`gh-pages` branch](https://github.com/katspaugh/wavesurfer.js/tree/gh-pages). Contributions to the documentation are especially welcome.

## Updating the NPM package
When preparing a new release, update the version in the `package.json` and have it merged to master. The new version of the package will be published to NPM automatically via GitHub Actions.

## Credits

The main maintainer: <img src="https://avatars.githubusercontent.com/u/305679" width="16" height="16" /> [Thijs Triemstra](https://github.com/thijstriemstra)

Many thanks to [all the awesome contributors](https://github.com/katspaugh/wavesurfer.js/contributors)!

## License

[![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)

This work is licensed under a
[BSD 3-Clause License](https://opensource.org/licenses/BSD-3-Clause).
