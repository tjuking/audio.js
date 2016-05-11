# audio.js

HTML5的音频播放组件，兼容解决iOS系统下自动播放(autoplay)和循环播放(loop)的问题。

目前整体设计比较简单，不依赖任何库，主要是解决移动端h5页面背景音乐播放的问题，之后会根据需求再做升级优化。

### 参数

* `src` - 音频的地址（字符串，建议使用mp3格式，体积可能会比较大但是兼容性很好）
* `autoPlay` - 设置是否自动播放音频（布尔值，需要同时设置`src`）
* `loop` - 设置是否循环播放音频（布尔值，需要同时设置`duration`）
* `duration` - 音频的时长（数值，配合循环播放时使用，单位是秒）
* `onXXX` - audio事件的回调响应（函数，例如`onPlaying`会在音频播放的时候执行此回调）

### 属性

* `.audio` - 实际的音频对象


### 接口

* `.load(src)` - 加载音频文件（传入音频文件地址的优先级高于参数设置的音频文件地址）
* `.play()` - 播放音频文件
* `.pause()` - 暂停播放


### 使用示例

首先需要引入播放组件，默认会产生一个全局变量 - `WebAudio`（如果通过[require.js](http://requirejs.org)或者其它模块管理工具的话，可以不生成全局变量）

    ```js
    
    //自动播放和循环播放的模式
    var bgAudio = new WebAudio({
        src: "http://www.w3school.com.cn/i/horse.mp3",
        autoPlay: true,
        loop: true,
        duration: 1.5
    });
    
    //按需播放模式
    var music = new WebAudio({
        src: "http://www.w3school.com.cn/i/horse.mp3"
    });
    //do something ...
    coin.addEventListener("touchstart", function(){
        music.load();
        music.play();
    }, false);
    
    ```
    
### 说明

iOS出于某些原因（用户体验？流量？）取消了音频自动播放的功能，需要用户的交互才能加载和播放音频。

解决思路就是在`document`元素上绑定`touchstart`事件，然后再加载和播放音频（如果页面中有播放开关，需要注意播放开关的显隐策略）。

如果要在iOS下循环播放就要在播放结束前（通过`updatetime`事件比对`currentTime`和`duration`来判断），将`currentTime`调整为0即可实现循环播放。
