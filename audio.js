/**
 * WebAudio.js
 * HTML5的音频播放组件，兼容解决iOS系统下自动播放(autoplay)和循环播放(loop)的问题
 * https://github.com/tjuking/audio.js
 */

(function (global, factory) {
    "use strict";

    if (typeof define === "function" && define.amd) {
        define(function () {
            return factory();
        });
    } else if (typeof exports !== "undefined") {
        module.exports = factory();
    } else {
        global.WebAudio = factory();
    }
})(window, function () {
    "use strict";

    /**
     * 封装的audio操作对象
     * @param option {object} 传入的参数
     * @constructor
     */
    var WebAudio = function (option) {
        var events = [
            "canplay", "canplaythrough", "durationchange", "emptied", "ended", "error",
            "onloadeddata", "loadedmetadata", "loadstart", "pause", "play", "playing",
            "progress", "ratechange", "readystatechange", "seeked", "seeking", "stalled",
            "suspend", "timeupdate", "volumechange", "waiting"
        ];
        var noop = function () { //空函数
        };
        var i;
        var key;
        option = option || {};
        this._events = events;
        this.options = {
            src: "", //声音来源
            autoPlay: false, //是否自动播放，默认是false
            loop: false, //是否循环播放，默认是false
            duration: 0 //声音长度，单位是秒
        };
        for (i = 0; i < events.length; i++) {
            this.options["on" + firstLetterUppercase(events[i])] = noop; //例如："onEnded"
        }
        for (key in option) {
            if (option.hasOwnProperty(key)) {
                this.options[key] = option[key];
            }
        }
        this.audio = new Audio();
        this._init();
    };
    WebAudio.prototype = {

        constructor: WebAudio,

        /**
         * 初始化入口函数
         * @private
         */
        _init: function () {
            var that = this;
            var i;
            var inIOS = isIOS();
            var options = this.options;
            for (i = 0; i < this._events.length; i++) { //添加事件
                this._addEventListener(this._events[i]);
            }
            if (inIOS) { //在iOS中的处理比较特殊一些
                if (options.loop) { //设置了循环播放
                    //通过时间更新来判断是否需要开始重新播放
                    this.audio.addEventListener("timeupdate", function (e) {
                        if (_getDuration() - that.audio.currentTime <= 0.8) { //当距离总时间小于0.2秒时，将重新播放
                            that.audio.currentTime = 0;
                        }
                    }, false);
                }
                if (options.autoPlay) { //设置了自动播放
                    document.addEventListener("touchstart", _autoPlay, false); //需要用户交互才能开始播放
                }
            } else { //非iOS环境下
                if (options.loop) { //设置了循环播放
                    this.audio.loop = true;
                }
                if (options.autoPlay) { //设置了自动播放
                    _autoPlay();
                }
            }

            /**
             * iOS下自动播放开始，完成后需要移除事件绑定
             * @private
             */
            function _autoPlay() {
                that.load();
                that.play();
                if (inIOS) {
                    document.removeEventListener("touchstart", _autoPlay, false);
                }
            }

            /**
             * 获取音频的时长
             * @returns {number} 音频的时长
             * @private
             */
            function _getDuration() {
                var duration = that.options.duration; //默认是用户传入的时间
                var audioDuration = that.audio.duration; //实际的音频长度（优先级更高）
                if (typeof audioDuration === "number" && !isNaN(audioDuration) && isFinite(audioDuration)) {
                    duration = audioDuration;
                }
                return duration;
            }
        },

        /**
         * 加载音频文件
         * @param [src] {string} 音频文件的地址
         */
        load: function (src) {
            this.audio.src = src || this.options.src;
        },

        /**
         * 播放
         */
        play: function () {
            this.audio.play();
        },

        /**
         * 暂停
         */
        pause: function () {
            this.audio.pause();
        },

        /**
         * 添加事件
         * @param event {string} 事件名称
         * @private
         */
        _addEventListener: function (event) {
            var that = this;
            this.audio.addEventListener(event, function (e) {
                that.options["on" + firstLetterUppercase(event)].call(that, e);
            }, false);
        }
    };

    /**
     * 首字母大写
     * @param word {string} 传入的字符串
     * @returns {string} 首字母大写后的字符串
     */
    function firstLetterUppercase(word) {
        if (typeof word === "string" && word.length) { //是字符串且长度不为0
            return word[0].toUpperCase() + word.substring(1);
        } else {
            return word;
        }
    }

    /**
     * 检测是否为iOS中
     * @returns {boolean} 是否在iOS中
     */
    function isIOS() {
        return /iPad|iPhone|iPod/i.test(navigator.userAgent) && !window.MSStream;
    }

    return WebAudio;
});