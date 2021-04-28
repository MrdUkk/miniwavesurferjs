import * as util from './util';
import MultiCanvas from './drawer.multicanvas';
import PeakCache from './peakcache';

/*
 * This work is licensed under a BSD-3-Clause License.
 */

/** @external {HTMLElement} https://developer.mozilla.org/en/docs/Web/API/HTMLElement */
/** @external {OfflineAudioContext} https://developer.mozilla.org/en-US/docs/Web/API/OfflineAudioContext */
/** @external {File} https://developer.mozilla.org/en-US/docs/Web/API/File */
/** @external {Blob} https://developer.mozilla.org/en-US/docs/Web/API/Blob */
/** @external {CanvasRenderingContext2D} https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D */
/** @external {MediaStreamConstraints} https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamConstraints */
/** @external {AudioNode} https://developer.mozilla.org/de/docs/Web/API/AudioNode */

/**
 * @typedef {Object} WavesurferParams
 * @property {AudioContext} audioContext=null Use your own previously
 * initialized AudioContext or leave blank.
 * @property {number} audioRate=1 Speed at which to play audio. Lower number is
 * slower.
 * @property {ScriptProcessorNode} audioScriptProcessor=null Use your own previously
 * initialized ScriptProcessorNode or leave blank.
 * @property {boolean} autoCenter=true If a scrollbar is present, center the
 * waveform on current progress
 * @property {number} autoCenterRate=5 If autoCenter is active, rate at which the
 * waveform is centered
 * @property {boolean} autoCenterImmediately=false If autoCenter is active, immediately
 * center waveform on current progress
 * `
 * @property {string} backgroundColor=null Change background color of the
 * waveform container.
 * @property {number} barHeight=1 The height of the wave bars.
 * @property {number} barRadius=0 The radius of the wave bars. Makes bars rounded
 * @property {number} barGap=null The optional spacing between bars of the wave,
 * if not provided will be calculated in legacy format.
 * @property {number} barWidth=null Draw the waveform using bars.
 * @property {number} barMinHeight=null If specified, draw at least a bar of this height,
 * eliminating waveform gaps
 * @property {!string|HTMLElement} container CSS selector or HTML element where
 * the waveform should be drawn. This is the only required parameter.
 * @property {string} cursorColor='#333' The fill color of the cursor indicating
 * the playhead position.
 * @property {number} cursorWidth=1 Measured in pixels.
 * @property {object} drawingContextAttributes={desynchronized: false} Drawing context
 * attributes.
 * @property {number} duration audio length in seconds so pre-rendered peaks
 * can be display immediately for example.
 * @property {boolean} fillParent=true Whether to fill the entire container or
 * draw only according to `minPxPerSec`.
 * @property {number} height=128 The height of the waveform. Measured in
 * pixels.
 * @property {boolean} hideScrollbar=false Whether to hide the horizontal
 * scrollbar when one would normally be shown.
 * @property {boolean} interact=true Whether the mouse interaction will be
 * enabled at initialization. You can switch this parameter at any time later
 * on.
 * @property {boolean} loopSelection=true (Use with regions plugin) Enable
 * looping of selected regions
 * @property {number} maxCanvasWidth=4000 Maximum width of a single canvas in
 * pixels, excluding a small overlap (2 * `pixelRatio`, rounded up to the next
 * even integer). If the waveform is longer than this value, additional canvases
 * will be used to render the waveform, which is useful for very large waveforms
 * that may be too wide for browsers to draw on a single canvas.
 * @property {number} minPxPerSec=20 Minimum number of pixels per second of
 * audio.
 * @property {boolean} normalize=false If true, normalize by the maximum peak
 * instead of 1.0.
 * @property {boolean} partialRender=false Use the PeakCache to improve
 * rendering speed of large waveforms
 * @property {number} pixelRatio=window.devicePixelRatio The pixel ratio used to
 * calculate display
 * @property {PluginDefinition[]} plugins=[] An array of plugin definitions to
 * register during instantiation, they will be directly initialised unless they
 * are added with the `deferInit` property set to true.
 * @property {string} progressColor='#555' The fill color of the part of the
 * waveform behind the cursor. When `progressColor` and `waveColor` are the same
 * the progress wave is not rendered at all.
 * @property {boolean} removeMediaElementOnDestroy=true Set to false to keep the
 * media element in the DOM when the player is destroyed. This is useful when
 * reusing an existing media element via the `loadMediaElement` method.
 * @property {Object} renderer=MultiCanvas Can be used to inject a custom
 * renderer.
 * @property {boolean|number} responsive=false If set to `true` resize the
 * waveform, when the window is resized. This is debounced with a `100ms`
 * timeout by default. If this parameter is a number it represents that timeout.
 * @property {boolean} rtl=false If set to `true`, renders waveform from
 * right-to-left.
 * @property {boolean} scrollParent=false Whether to scroll the container with a
 * lengthy waveform. Otherwise the waveform is shrunk to the container width
 * (see fillParent).
 * @property {number} skipLength=2 Number of seconds to skip with the
 * skipForward() and skipBackward() methods.
 * @property {boolean} splitChannels=false Render with separate waveforms for
 * the channels of the audio
 * @property {SplitChannelOptions} splitChannelsOptions={} Options for splitChannel rendering
 * @property {boolean} vertical=false Render the waveform vertically instead of horizontally.
 * @property {string} waveColor='#999' The fill color of the waveform after the
 * cursor.
 */

/**
 * @typedef {Object} PluginDefinition
 * @desc The Object used to describe a plugin
 * @example wavesurfer.addPlugin(pluginDefinition);
 * @property {string} name The name of the plugin, the plugin instance will be
 * added as a property to the wavesurfer instance under this name
 * @property {?Object} staticProps The properties that should be added to the
 * wavesurfer instance as static properties
 * @property {?boolean} deferInit Don't initialise plugin
 * automatically
 * @property {Object} params={} The plugin parameters, they are the first parameter
 * passed to the plugin class constructor function
 * @property {PluginClass} instance The plugin instance factory, is called with
 * the dependency specified in extends. Returns the plugin class.
 */

/**
 * @typedef {Object} SplitChannelOptions
 * @desc parameters applied when splitChannels option is true
 * @property {boolean} overlay=false determines whether channels are rendered on top of each other or on separate tracks
 * @property {object} channelColors={} object describing color for each channel. Example:
 * {
 *     0: {
 *         progressColor: 'green',
 *         waveColor: 'pink'
 *     },
 *     1: {
 *         progressColor: 'orange',
 *         waveColor: 'purple'
 *     }
 * }
 * @property {number[]} filterChannels=[] indexes of channels to be hidden from rendering
 * @property {boolean} relativeNormalization=false determines whether
 * normalization is done per channel or maintains proportionality between
 * channels. Only applied when normalize and splitChannels are both true.
 * @since 4.3.0
 */

/**
 * @interface PluginClass
 *
 * @desc This is the interface which is implemented by all plugin classes. Note
 * that this only turns into an observer after being passed through
 * `wavesurfer.addPlugin`.
 *
 * @extends {Observer}
 */
class PluginClass {
    /**
     * Plugin definition factory
     *
     * This function must be used to create a plugin definition which can be
     * used by wavesurfer to correctly instantiate the plugin.
     *
     * It returns a `PluginDefinition` object representing the plugin.
     *
     * @param {Object} params={} The plugin params (specific to the plugin)
     */
    create(params) {}
    /**
     * Construct the plugin
     *
     * @param {Object} params={} The plugin params (specific to the plugin)
     * @param {Object} ws The wavesurfer instance
     */
    constructor(params, ws) {}
    /**
     * Initialise the plugin
     *
     * Start doing something. This is called by
     * `wavesurfer.initPlugin(pluginName)`
     */
    init() {}
    /**
     * Destroy the plugin instance
     *
     * Stop doing something. This is called by
     * `wavesurfer.destroyPlugin(pluginName)`
     */
    destroy() {}
}

/**
 * WaveSurfer core library class
 *
 * @extends {Observer}
 * @example
 * const params = {
 *   container: '#waveform',
 *   waveColor: 'violet',
 *   progressColor: 'purple'
 * };
 *
 * // initialise like this
 * const wavesurfer = WaveSurfer.create(params);
 *
 * // or like this ...
 * const wavesurfer = new WaveSurfer(params);
 * wavesurfer.init();
 *
 * // load audio file
 * wavesurfer.load('example/media/demo.wav');
 */
export default class WaveSurfer extends util.Observer {
    /** @private */
    defaultParams = {
        audioRate: 1,
        autoCenter: true,
        autoCenterRate: 5,
        autoCenterImmediately: false,
        backgroundColor: null,
        barHeight: 1,
        barRadius: 0,
        barGap: null,
        barMinHeight: null,
        container: null,
        cursorColor: '#333',
        cursorWidth: 1,
        dragSelection: true,
        drawingContextAttributes: {
            // Boolean that hints the user agent to reduce the latency
            // by desynchronizing the canvas paint cycle from the event
            // loop
            desynchronized: false
        },
        duration: 0,
        curPosition: 0,
        fillParent: true,
        height: 128,
        hideScrollbar: false,
        interact: true,
        loopSelection: true,
        maxCanvasWidth: 4000,
        minPxPerSec: 20,
        normalize: false,
        peakMax: 0,
        partialRender: false,
        peaks: null,
        pixelRatio:
            window.devicePixelRatio || screen.deviceXDPI / screen.logicalXDPI,
        plugins: [],
        progressColor: '#555',
        renderer: MultiCanvas,
        responsive: false,
        rtl: false,
        scrollParent: false,
        skipLength: 2,
        splitChannels: false,
        splitChannelsOptions: {
            overlay: false,
            channelColors: {},
            filterChannels: [],
            relativeNormalization: false
        },
        vertical: false,
        waveColor: '#999'
    };

    /**
     * Instantiate this class, call its `init` function and returns it
     *
     * @param {WavesurferParams} params The wavesurfer parameters
     * @return {Object} WaveSurfer instance
     * @example const wavesurfer = WaveSurfer.create(params);
     */
    static create(params) {
        const wavesurfer = new WaveSurfer(params);
        return wavesurfer.init();
    }

    /**
     * The library version number is available as a static property of the
     * WaveSurfer class
     *
     * @type {String}
     * @example
     * console.log('Using wavesurfer.js ' + WaveSurfer.VERSION);
     */
    static VERSION = __VERSION__;

    /**
     * Functions in the `util` property are available as a prototype property to
     * all instances
     *
     * @type {Object}
     * @example
     * const wavesurfer = WaveSurfer.create(params);
     * wavesurfer.util.style(myElement, { background: 'blue' });
     */
    util = util;

    /**
     * Functions in the `util` property are available as a static property of the
     * WaveSurfer class
     *
     * @type {Object}
     * @example
     * WaveSurfer.util.style(myElement, { background: 'blue' });
     */
    static util = util;

    /**
     * Initialise wavesurfer instance
     *
     * @param {WavesurferParams} params Instantiation options for wavesurfer
     * @example
     * const wavesurfer = new WaveSurfer(params);
     * @returns {this} Wavesurfer instance
     */
    constructor(params) {
        super();
        /**
         * Extract relevant parameters (or defaults)
         * @private
         */
        this.params = Object.assign({}, this.defaultParams, params);
        this.params.splitChannelsOptions = Object.assign(
            {},
            this.defaultParams.splitChannelsOptions,
            params.splitChannelsOptions
        );
        /** @private */
        this.container =
            'string' == typeof params.container
                ? document.querySelector(this.params.container)
                : this.params.container;

        if (!this.container) {
            throw new Error('Container element not found');
        }

        if (this.params.maxCanvasWidth <= 1) {
            throw new Error('maxCanvasWidth must be greater than 1');
        } else if (this.params.maxCanvasWidth % 2 == 1) {
            throw new Error('maxCanvasWidth must be an even number');
        }

        if (this.params.rtl === true) {
            if (this.params.vertical === true) {
                util.style(this.container, { transform: 'rotateX(180deg)' });
            } else {
                util.style(this.container, { transform: 'rotateY(180deg)' });
            }
        }

        if (this.params.backgroundColor) {
            this.setBackgroundColor(this.params.backgroundColor);
        }

        /**
         * @private Holds any running audio downloads
         * @type {Observer}
         */
        /** @private */
        this.drawer = null;
        /** @private */
        this.peakCache = null;

        // cache constructor objects
        if (typeof this.params.renderer !== 'function') {
            throw new Error('Renderer parameter is invalid');
        }
        /**
         * @private The uninitialised Drawer class
         */
        this.Drawer = this.params.renderer;

        /**
         * @private map of plugin names that are currently initialised
         */
        this.initialisedPluginList = {};
        /** @private */
        this.isDestroyed = false;

        /**
         * Get the current ready status.
         *
         * @example const isReady = wavesurfer.isReady;
         * @return {boolean}
         */
        this.isReady = false;

        // responsive debounced event listener. If this.params.responsive is not
        // set, this is never called. Use 100ms or this.params.responsive as
        // timeout for the debounce function.
        let prevWidth = 0;
        this._onResize = util.debounce(
            () => {
                if (
                    prevWidth != this.drawer.wrapper.clientWidth &&
                    !this.params.scrollParent
                ) {
                    prevWidth = this.drawer.wrapper.clientWidth;
                    this.drawer.fireEvent('redraw');
                }
            },
            typeof this.params.responsive === 'number'
                ? this.params.responsive
                : 100
        );

        return this;
    }

    /**
     * Initialise the wave
     *
     * @example
     * var wavesurfer = new WaveSurfer(params);
     * wavesurfer.init();
     * @return {this} The wavesurfer instance
     */
    init() {
        this.registerPlugins(this.params.plugins);
        this.createDrawer();
        this.createPeakCache();
        return this;
    }

    /**
     * Add and initialise array of plugins (if `plugin.deferInit` is falsey),
     * this function is called in the init function of wavesurfer
     *
     * @param {PluginDefinition[]} plugins An array of plugin definitions
     * @emits {WaveSurfer#plugins-registered} Called with the array of plugin definitions
     * @return {this} The wavesurfer instance
     */
    registerPlugins(plugins) {
        // first instantiate all the plugins
        plugins.forEach(plugin => this.addPlugin(plugin));

        // now run the init functions
        plugins.forEach(plugin => {
            // call init function of the plugin if deferInit is falsey
            // in that case you would manually use initPlugins()
            if (!plugin.deferInit) {
                this.initPlugin(plugin.name);
            }
        });
        this.fireEvent('plugins-registered', plugins);
        return this;
    }

    /**
     * Get a map of plugin names that are currently initialised
     *
     * @example wavesurfer.getPlugins();
     * @return {Object} Object with plugin names
     */
    getActivePlugins() {
        return this.initialisedPluginList;
    }

    /**
     * Add a plugin object to wavesurfer
     *
     * @param {PluginDefinition} plugin A plugin definition
     * @emits {WaveSurfer#plugin-added} Called with the name of the plugin that was added
     * @example wavesurfer.addPlugin(WaveSurfer.minimap());
     * @return {this} The wavesurfer instance
     */
    addPlugin(plugin) {
        if (!plugin.name) {
            throw new Error('Plugin does not have a name!');
        }
        if (!plugin.instance) {
            throw new Error(
                `Plugin ${plugin.name} does not have an instance property!`
            );
        }

        // staticProps properties are applied to wavesurfer instance
        if (plugin.staticProps) {
            Object.keys(plugin.staticProps).forEach(pluginStaticProp => {
                /**
                 * Properties defined in a plugin definition's `staticProps` property are added as
                 * staticProps properties of the WaveSurfer instance
                 */
                this[pluginStaticProp] = plugin.staticProps[pluginStaticProp];
            });
        }

        const Instance = plugin.instance;

        // turn the plugin instance into an observer
        const observerPrototypeKeys = Object.getOwnPropertyNames(
            util.Observer.prototype
        );
        observerPrototypeKeys.forEach(key => {
            Instance.prototype[key] = util.Observer.prototype[key];
        });

        /**
         * Instantiated plugin classes are added as a property of the wavesurfer
         * instance
         * @type {Object}
         */
        this[plugin.name] = new Instance(plugin.params || {}, this);
        this.fireEvent('plugin-added', plugin.name);
        return this;
    }

    /**
     * Initialise a plugin
     *
     * @param {string} name A plugin name
     * @emits WaveSurfer#plugin-initialised
     * @example wavesurfer.initPlugin('minimap');
     * @return {this} The wavesurfer instance
     */
    initPlugin(name) {
        if (!this[name]) {
            throw new Error(`Plugin ${name} has not been added yet!`);
        }
        if (this.initialisedPluginList[name]) {
            // destroy any already initialised plugins
            this.destroyPlugin(name);
        }
        this[name].init();
        this.initialisedPluginList[name] = true;
        this.fireEvent('plugin-initialised', name);
        return this;
    }

    /**
     * Destroy a plugin
     *
     * @param {string} name A plugin name
     * @emits WaveSurfer#plugin-destroyed
     * @example wavesurfer.destroyPlugin('minimap');
     * @returns {this} The wavesurfer instance
     */
    destroyPlugin(name) {
        if (!this[name]) {
            throw new Error(
                `Plugin ${name} has not been added yet and cannot be destroyed!`
            );
        }
        if (!this.initialisedPluginList[name]) {
            throw new Error(
                `Plugin ${name} is not active and cannot be destroyed!`
            );
        }
        if (typeof this[name].destroy !== 'function') {
            throw new Error(`Plugin ${name} does not have a destroy function!`);
        }

        this[name].destroy();
        delete this.initialisedPluginList[name];
        this.fireEvent('plugin-destroyed', name);
        return this;
    }

    /**
     * Destroy all initialised plugins. Convenience function to use when
     * wavesurfer is removed
     *
     * @private
     */
    destroyAllPlugins() {
        Object.keys(this.initialisedPluginList).forEach(name =>
            this.destroyPlugin(name)
        );
    }

    /**
     * Create the drawer and draw the waveform
     *
     * @private
     * @emits WaveSurfer#drawer-created
     */
    createDrawer() {
        this.drawer = new this.Drawer(this.container, this.params);
        this.drawer.init();
        this.fireEvent('drawer-created', this.drawer);

        if (this.params.responsive !== false) {
            window.addEventListener('resize', this._onResize, true);
            window.addEventListener('orientationchange', this._onResize, true);
        }

        this.drawer.on('redraw', () => {
            this.drawBuffer();
            this.drawer.progress(this.backend.getPlayedPercents());
        });

        // Click-to-seek
        this.drawer.on('click', (e, progress) => {
            setTimeout(() => this.seekTo(progress), 0);
        });

        // Relay the scroll event from the drawer
        this.drawer.on('scroll', e => {
            if (this.params.partialRender) {
                this.drawBuffer();
            }
            this.fireEvent('scroll', e);
        });
    }

    /**
     * Create the peak cache
     *
     * @private
     */
    createPeakCache() {
        if (this.params.partialRender) {
            this.peakCache = new PeakCache();
        }
    }

    /**
     * Get the duration of the audio clip
     *
     * @example const duration = wavesurfer.getDuration();
     * @return {number} Duration in seconds
     */
    getDuration() {
        return this.duration;
    }

    /**
     * Get the current playback position
     *
     * @example const currentTime = wavesurfer.getCurrentTime();
     * @return {number} Playback position in seconds
     */
    getCurrentTime() {
	return this.curPosition;
    }

    /**
     * Set the current play time in seconds.
     *
     * @param {number} seconds A positive number in seconds. E.g. 10 means 10
     * seconds, 60 means 1 minute
     */
    setCurrentTime(seconds) {
        if (seconds >= this.duration) {
            this.seekTo(1);
        } else {
            this.seekTo(seconds / this.duration);
        }
    }
    
    
    getPlayedPercents() {
	return this.getCurrentTime() / this.duration || 0;
    }

    /**
     * Starts playback from the current position. Optional start and end
     * measured in seconds can be used to set the range of audio to play.
     *
     * @param {?number} start Position to start at
     * @param {?number} end Position to end at
     * @emits WaveSurfer#interaction
     * @return {Promise} Result of the backend play method
     * @example
     * // play from second 1 to 5
     * wavesurfer.play(1, 5);
     */
    play(start, end) {
        this.fireEvent('interaction', () => this.play(start, end));
        console.log('play() called' + start + ' ' + end);
        //return this.backend.play(start, end);
    }

    /**
     * Set a point in seconds for playback to stop at.
     *
     * @param {number} position Position (in seconds) to stop at
     * @version 3.3.0
     */
    setPlayEnd(position) {
	console.log('setPlayEnd() called ' + position);
        //this.backend.setPlayEnd(position);
    }

    /**
     * Stops and pauses playback
     *
     * @example wavesurfer.pause();
     * @return {Promise} Result of the backend pause method
     */
    pause() {
	console.log('pause() called');
        //if (!this.backend.isPaused()) {
        //    return this.backend.pause();
        //}
    }

    /**
     * Toggle playback
     *
     * @example wavesurfer.playPause();
     * @return {Promise} Result of the backend play or pause method
     */
    playPause() {
	console.log('playPause called');
        //return this.backend.isPaused() ? this.play() : this.pause();
    }

    /**
     * Get the current playback state
     *
     * @example const isPlaying = wavesurfer.isPlaying();
     * @return {boolean} False if paused, true if playing
     */
    isPlaying() {
	console.log('isPlaying called');
        //return !this.backend.isPaused();
    }

    /**
     * Skip backward
     *
     * @param {?number} seconds Amount to skip back, if not specified `skipLength`
     * is used
     * @example wavesurfer.skipBackward();
     */
    skipBackward(seconds) {
        this.skip(-seconds || -this.params.skipLength);
    }

    /**
     * Skip forward
     *
     * @param {?number} seconds Amount to skip back, if not specified `skipLength`
     * is used
     * @example wavesurfer.skipForward();
     */
    skipForward(seconds) {
        this.skip(seconds || this.params.skipLength);
    }

    /**
     * Skip a number of seconds from the current position (use a negative value
     * to go backwards).
     *
     * @param {number} offset Amount to skip back or forwards
     * @example
     * // go back 2 seconds
     * wavesurfer.skip(-2);
     */
    skip(offset) {
        const duration = this.duration || 1;
        let position = this.getCurrentTime() || 0;
        position = Math.max(0, Math.min(duration, position + (offset || 0)));
        this.seekAndCenter(position / duration);
    }

    /**
     * Seeks to a position and centers the view
     *
     * @param {number} progress Between 0 (=beginning) and 1 (=end)
     * @example
     * // seek and go to the middle of the audio
     * wavesurfer.seekTo(0.5);
     */
    seekAndCenter(progress) {
        this.seekTo(progress);
        this.drawer.recenter(progress);
    }

    /**
     * Seeks to a position
     *
     * @param {number} progress Between 0 (=beginning) and 1 (=end)
     * @emits WaveSurfer#interaction
     * @emits WaveSurfer#seek
     * @example
     * // seek to the middle of the audio
     * wavesurfer.seekTo(0.5);
     */
    seekTo(progress) {
        // return an error if progress is not a number between 0 and 1
        if (
            typeof progress !== 'number' ||
            !isFinite(progress) ||
            progress < 0 ||
            progress > 1
        ) {
            throw new Error(
                'Error calling wavesurfer.seekTo, parameter must be a number between 0 and 1!'
            );
        }
        this.fireEvent('interaction', () => this.seekTo(progress));

        // avoid small scrolls while paused seeking
        const oldScrollParent = this.params.scrollParent;
        this.params.scrollParent = false;
        this.curPosition = progress * this.getDuration();
        this.drawer.progress(progress);

        this.params.scrollParent = oldScrollParent;
        this.fireEvent('seek', progress);
    }

    /**
     * Stops and goes to the beginning.
     *
     * @example wavesurfer.stop();
     */
    stop() {
        this.pause();
        this.seekTo(0);
    }

    /**
     * Set the playback rate.
     *
     * @param {number} rate A positive number. E.g. 0.5 means half the normal
     * speed, 2 means double speed and so on.
     * @example wavesurfer.setPlaybackRate(2);
     */
    setPlaybackRate(rate) {
        //this.backend.setPlaybackRate(rate);
    }

    /**
     * Get the playback rate.
     *
     * @return {number} The current playback rate.
     */
    getPlaybackRate() {
        //return this.backend.getPlaybackRate();
    }

    /**
     * Toggles `scrollParent` and redraws
     *
     * @example wavesurfer.toggleScroll();
     */
    toggleScroll() {
        this.params.scrollParent = !this.params.scrollParent;
        this.drawBuffer();
    }

    /**
     * Toggle mouse interaction
     *
     * @example wavesurfer.toggleInteraction();
     */
    toggleInteraction() {
        this.params.interact = !this.params.interact;
    }

    /**
     * Get the fill color of the waveform after the cursor.
     *
     * @return {string} A CSS color string.
     */
    getWaveColor() {
        return this.params.waveColor;
    }

    /**
     * Set the fill color of the waveform after the cursor.
     *
     * @param {string} color A CSS color string.
     * @example wavesurfer.setWaveColor('#ddd');
     */
    setWaveColor(color) {
        this.params.waveColor = color;
        this.drawBuffer();
    }

    /**
     * Get the fill color of the waveform behind the cursor.
     *
     * @return {string} A CSS color string.
     */
    getProgressColor() {
        return this.params.progressColor;
    }

    /**
     * Set the fill color of the waveform behind the cursor.
     *
     * @param {string} color A CSS color string.
     * @example wavesurfer.setProgressColor('#400');
     */
    setProgressColor(color) {
        this.params.progressColor = color;
        this.drawBuffer();
    }

    /**
     * Get the background color of the waveform container.
     *
     * @return {string} A CSS color string.
     */
    getBackgroundColor() {
        return this.params.backgroundColor;
    }

    /**
     * Set the background color of the waveform container.
     *
     * @param {string} color A CSS color string.
     * @example wavesurfer.setBackgroundColor('#FF00FF');
     */
    setBackgroundColor(color) {
        this.params.backgroundColor = color;
        util.style(this.container, { background: this.params.backgroundColor });
    }

    /**
     * Get the fill color of the cursor indicating the playhead
     * position.
     *
     * @return {string} A CSS color string.
     */
    getCursorColor() {
        return this.params.cursorColor;
    }

    /**
     * Set the fill color of the cursor indicating the playhead
     * position.
     *
     * @param {string} color A CSS color string.
     * @example wavesurfer.setCursorColor('#222');
     */
    setCursorColor(color) {
        this.params.cursorColor = color;
        this.drawer.updateCursor();
    }

    /**
     * Get the height of the waveform.
     *
     * @return {number} Height measured in pixels.
     */
    getHeight() {
        return this.params.height;
    }

    /**
     * Set the height of the waveform.
     *
     * @param {number} height Height measured in pixels.
     * @example wavesurfer.setHeight(200);
     */
    setHeight(height) {
        this.params.height = height;
        this.drawer.setHeight(height * this.params.pixelRatio);
        this.drawBuffer();
    }

    /**
     * Hide channels from being drawn on the waveform if splitting channels.
     *
     * For example, if we want to draw only the peaks for the right stereo channel:
     *
     * const wavesurfer = new WaveSurfer.create({...splitChannels: true});
     * wavesurfer.load('stereo_audio.mp3');
     *
     * wavesurfer.setFilteredChannel([0]); <-- hide left channel peaks.
     *
     * @param {array} channelIndices Channels to be filtered out from drawing.
     * @version 4.0.0
     */
    setFilteredChannels(channelIndices) {
        this.params.splitChannelsOptions.filterChannels = channelIndices;
        this.drawBuffer();
    }

    /**
     * Get the correct peaks for current wave view-port and render wave
     *
     * @private
     * @emits WaveSurfer#redraw
     */
    drawBuffer() {
        const nominalWidth = Math.round(
            this.duration *
                this.params.minPxPerSec *
                this.params.pixelRatio
        );
        const parentWidth = this.drawer.getWidth();
        let width = nominalWidth;
        // always start at 0 after zooming for scrolling : issue redraw left part
        let start = 0;
        let end = Math.max(start + parentWidth, width);
        // Fill container
        if (
            this.params.fillParent &&
            (!this.params.scrollParent || nominalWidth < parentWidth)
        ) {
            width = parentWidth;
            start = 0;
            end = width;
        }

        //let peaks;
        if (this.params.partialRender) {
            const newRanges = this.peakCache.addRangeToPeakCache(
                width,
                start,
                end
            );
            let i;
            for (i = 0; i < newRanges.length; i++) {
                //peaks = this.backend.getPeaks(width, newRanges[i][0], newRanges[i][1]);
                this.drawer.drawPeaks(this.peaks, width, newRanges[i][0], newRanges[i][1]);
            }
        } else {
            //peaks = this.backend.getPeaks(width, start, end);
            this.drawer.drawPeaks(this.peaks, width, start, end);
        }
        this.fireEvent('redraw', this.peaks, width);
    }

    /**
     * Horizontally zooms the waveform in and out. It also changes the parameter
     * `minPxPerSec` and enables the `scrollParent` option. Calling the function
     * with a falsey parameter will reset the zoom state.
     *
     * @param {?number} pxPerSec Number of horizontal pixels per second of
     * audio, if none is set the waveform returns to unzoomed state
     * @emits WaveSurfer#zoom
     * @example wavesurfer.zoom(20);
     */
    zoom(pxPerSec) {
        if (!pxPerSec) {
            this.params.minPxPerSec = this.defaultParams.minPxPerSec;
            this.params.scrollParent = false;
        } else {
            this.params.minPxPerSec = pxPerSec;
            this.params.scrollParent = true;
        }

        this.drawBuffer();
        this.drawer.progress(this.getPlayedPercents());
        this.drawer.recenter(this.getCurrentTime() / this.getDuration());
        this.fireEvent('zoom', pxPerSec);
    }

    /**
     * Loads audio and re-renders the waveform.
     *
     * @param {number[]|Number.<Array[]>} peaks Wavesurfer does not have to decode
     * the audio to render the waveform if this is specified
     * @param {?number} duration The duration of the audio. This is used to
     * render the peaks data in the correct size for the audio duration (as
     * befits the current `minPxPerSec` and zoom value) without having to decode
     * the audio.
     * @returns {void}
     * @throws Will throw an error if the `peaks` argument is empty.
     *
     * @example
     * // setting preload attribute with media element backend and supplying
     * // peaks
     * wavesurfer.load(
     *   [0.0218, 0.0183, 0.0165, 0.0198, 0.2137, 0.2888],
     *   true
     * );
     */
    load(peaks, duration, pmax) {
        if (!peaks || peaks.length == 0) {
            throw new Error('peaks cannot be empty');
        }
        
        if(!duration) {
    	    throw new Error('duration parameter cannot be empty');
        }
        
        this.empty();

        this.peaks = peaks
        this.duration = duration;
        this.peakMax = pmax || 0;
        this.drawBuffer();
        this.isReady = true;
        this.fireEvent('ready');
    }

    /**
     * Exports PCM data into a JSON array and opens in a new window.
     *
     * @param {number} length=1024 The scale in which to export the peaks
     * @param {number} accuracy=10000
     * @param {?boolean} noWindow Set to true to disable opening a new
     * window with the JSON
     * @param {number} start Start index
     * @param {number} end End index
     * @return {Promise} Promise that resolves with array of peaks
     */
    exportPCM(length, accuracy, noWindow, start, end) {
        length = length || 1024;
        start = start || 0;
        accuracy = accuracy || 10000;
        noWindow = noWindow || false;
        //const peaks = this.backend.getPeaks(length, start, end);
        const arr = [].map.call(
            peaks,
            val => Math.round(val * accuracy) / accuracy
        );
        return new Promise((resolve, reject) => {
            const json = JSON.stringify(arr);

            if (!noWindow) {
                window.open(
                    'data:application/json;charset=utf-8,' +
                        encodeURIComponent(json)
                );
            }
            resolve(json);
        });
    }

    /**
     * Save waveform image as data URI.
     *
     * The default format is `'image/png'`. Other supported types are
     * `'image/jpeg'` and `'image/webp'`.
     *
     * @param {string} format='image/png' A string indicating the image format.
     * The default format type is `'image/png'`.
     * @param {number} quality=1 A number between 0 and 1 indicating the image
     * quality to use for image formats that use lossy compression such as
     * `'image/jpeg'`` and `'image/webp'`.
     * @param {string} type Image data type to return. Either 'dataURL' (default)
     * or 'blob'.
     * @return {string|string[]|Promise} When using `'dataURL'` type this returns
     * a single data URL or an array of data URLs, one for each canvas. When using
     * `'blob'` type this returns a `Promise` resolving with an array of `Blob`
     * instances, one for each canvas.
     */
    exportImage(format, quality, type) {
        if (!format) {
            format = 'image/png';
        }
        if (!quality) {
            quality = 1;
        }
        if (!type) {
            type = 'dataURL';
        }

        return this.drawer.getImage(format, quality, type);
    }

    /**
     * Display empty waveform.
     */
    empty() {
        //if (!this.backend.isPaused()) {
            this.stop();
            //this.backend.disconnectSource();
        //}
        this.curPosition = 0;
        this.duration = 0;
        this.isReady = false;

        // empty drawer
        this.drawer.progress(0);
        this.drawer.setWidth(0);
        this.drawer.drawPeaks({ length: this.drawer.getWidth() }, 0);
    }

    /**
     * Remove events, elements and disconnect WebAudio nodes.
     *
     * @emits WaveSurfer#destroy
     */
    destroy() {
        this.destroyAllPlugins();
        this.fireEvent('destroy');
        this.unAll();
        if (this.params.responsive !== false) {
            window.removeEventListener('resize', this._onResize, true);
            window.removeEventListener(
                'orientationchange',
                this._onResize,
                true
            );
        }
        if (this.drawer) {
            this.drawer.destroy();
        }
        this.isDestroyed = true;
        this.isReady = false;
    }
}
