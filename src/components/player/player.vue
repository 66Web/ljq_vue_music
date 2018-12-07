<template>
   <div class="player" v-show="playlist.length">
     <transition name="normal" @enter="enter" @after-enter="afterEnter" @leave="leave" @after-leave="afterLeave">
       <div class="normal-player" v-show="fullScreen">
           <div class="background">
              <img width="100%" height="100%" :src="currentSong.image">
           </div>
           <div class="top">
              <div class="back">
                <i class="icon-back" @click="back"></i>
              </div>
              <h1 class="title" v-html="currentSong.name"></h1>
              <h2 class="subtitle" v-html="currentSong.singer"></h2>
           </div>
           <div class="middle" @touchstart.prevent="middleTouchStart" 
                               @touchmove.prevent="middleTouchMove" 
                               @touchend="middleTouchEnd">
              <div class="middle-l" ref="middleL">
                <div class="cd-wrapper" ref="cdWrapper">
                   <div class="cd" :class="cdCls">
                      <img class="image" :src="currentSong.image">
                   </div>
                </div>
                <div class="playing-lyric-wrapper">
                   <div class="playing-lyric">{{playingLyric}}</div>
                </div>
              </div>
              <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
                 <div class="lyric-wrapper">
                    <div v-if="currentLyric">
                        <p ref="lyricLine"
                           class="text"
                           v-for="(line, index) in currentLyric.lines" :key="index"
                           :class="{'current': currentLineNum === index}">
                           {{line.txt}}
                        </p>
                    </div>
                 </div>
              </scroll>
           </div>
           <div class="bottom">
              <div class="dot-wrapper">
                  <span class="dot" :class="{'active': currentShow === 'cd'}"></span>
                  <span class="dot" :class="{'active': currentShow === 'lyric'}"></span>
              </div>
              <div class="progress-wrapper">
                 <span class="time time-l">{{format(currentTime)}}</span>
                 <div class="progress-bar-wrapper">
                      <progress-bar :percent="percent" @percentChange="onProgressBarChange"></progress-bar>
                 </div>
                 <span class="time time-r">{{format(currentSong.duration)}}</span>
              </div>
              <div class="operators">
                 <div class="icon i-left" @click="changeMode">
                     <i :class="iconMode"></i>
                 </div>
                 <div class="icon i-left" :class="disableCls">
                     <i class="icon-prev" @click="prev"></i>
                 </div>
                 <div class="icon i-center" :class="disableCls">
                     <i :class="playIcon" @click="togglePlaying"></i>
                 </div>
                 <div class="icon i-right" :class="disableCls">
                     <i class="icon-next" @click="next"></i>
                 </div>
                 <div class="icon i-right">
                     <i class="icon" :class="getFavoriteIcon(currentSong)"  @click="toggleFavorite(currentSong)"></i>
                 </div>
              </div>
           </div>
       </div>
     </transition>
     <transition name="mini">
       <div class="mini-player" v-show="!fullScreen" @click="open">
           <div class="icon">
               <img :class="cdCls" width="40" heoght="40" :src="currentSong.image">
           </div>
           <div class="text">
               <h2 class="name" v-html="currentSong.name"></h2>
               <p class="desc" v-html="currentSong.singer"></p>
           </div>
           <div class="control">
               <progress-circle  :radius="radius" :percent="percent">
                     <i :class="miniIcon" @click.stop.prevent="togglePlaying" class="icon-mini"></i>
               </progress-circle>
           </div>
           <div class="control" @click.stop.prevent="showPlaylist">
               <i class="icon-playlist"></i>     
           </div>
       </div>
      </transition>
      <play-list ref="playlist"></play-list>
      <audio :src="currentSong.url" ref="audio" 
             @play="ready" @error="error" @timeupdate="updateTime" @ended="end"></audio>    
   </div>
</template>

<script>
import {mapGetters, mapMutations, mapActions} from 'vuex'
import animations from 'create-keyframe-animation'
import {prefixStyle} from '@/common/js/dom'
import ProgressBar from '@/base/progress-bar/progress-bar'
import ProgressCircle from '@/base/progress-circle/progress-circle'
import {playMode} from '@/common/js/config'
import Lyric from 'lyric-parser'
import Scroll from '@/base/scroll/scroll'
import PlayList from '@/components/playlist/playlist'
import {playerMixin} from '@/common/js/mixin'

const transform = prefixStyle('transform')
const transitionDuration = prefixStyle('transition-duration')

export default {
    mixins:[playerMixin],
    components: {
       ProgressBar,
       ProgressCircle,
       Scroll,
       PlayList
    },
    data() {
       return {
         songReady: false,
         currentTime: 0,
         radius: 32,
         currentLyric: null,
         currentLineNum: 0,
         currentShow: 'cd',
         playingLyric: ''
       }
    },
    computed: {
       cdCls() {
          return this.playing ? 'play' : 'pause'
       },
       playIcon() {
          return this.playing ? 'icon-pause' : 'icon-play'
       },
       miniIcon() {
          return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
       },
       disableCls() {
          return this.songReady ? '' : 'disable'
       },
       percent(){
          return this.currentTime / this.currentSong.duration
       },
        ...mapGetters([
            'fullScreen',
            'playing',
            'currentIndex'
        ])
    },
    created(){
        this.touch = {}
    },
    // mounted() {
    //   console.log(this.currentSong)
    // },
    methods: {
      back() {
        //错误做法： this.fullScreen = false
        //正确做法： 通过mapMutations写入
        this.setFullScreen(false)
      },
      open() {
        this.setFullScreen(true)
      },
      //事件钩子: 创建CSS3动画
      enter(el, done){
          const {x, y, scale} = this._getPosAndScale()

          let animation = {
              0: {
                transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`
              },
              60: {
                transform: `translate3d(0, 0, 0) scale(1.1)`
              }, 
              100: {
                transform: `translate3d(0, 0, 0) scale(1)`
              }
          }

          animations.registerAnimation({
             name: 'move',
             animation,
             presets: {
               duration: 400,
               easing: 'linear'
             }
          })

          animations.runAnimation(this.$refs.cdWrapper, 'move', done)
      },
      afterEnter() {
          animations.unregisterAnimation('move')
          this.$refs.cdWrapper.style.animation = ''
      },
      leave(el, done){
          this.$refs.cdWrapper.style.transition = 'all 0.4s'
          const {x, y, scale} = this._getPosAndScale()
          this.$refs.cdWrapper.style[transform] = `translate3d(${x}px, ${y}px, 0) scale(${scale})`
          this.$refs.cdWrapper.addEventListener('transitionend', done)
      },
      afterLeave(){
          this.$refs.cdWrapper.style.transition = ''
          this.$refs.cdWrapper.style[transform] = ''
      },
      //控制播放状态
      togglePlaying(){
          if(!this.songReady){
              return
          }
          this.setPlayingState(!this.playing)
          if(this.currentLyric){
             this.currentLyric.togglePlay() //歌词切换播放暂停
          }
      },
      end(){
          if(this.mode === playMode.loop){
              this.loop()
          }else{
              this.next()
          }  
      },
      loop(){
         this.$refs.audio.currentTime = 0
         this.$refs.audio.play()
         if(this.currentLyric){
           this.currentLyric.seek(0) //歌词偏移到一开始
         }
      },
      next() {
          if(!this.songReady){
            return
          }
          if(this.playlist.length === 1){ //只有一首歌，单曲循环
            this.loop()
            return
          }else{
            let index = this.currentIndex + 1
            if(index === this.playlist.length){
                index = 0
            }
            this.setCurrentIndex(index)
            if(!this.playing){
                this.togglePlaying()
            }
          }
          this.songReady = false
       },
      prev() {
          if(!this.songReady){
            return
          }
          if(this.playlist.length === 1){ //只有一首歌，单曲循环
            this.loop()
            return
          }else{
            let index = this.currentIndex - 1
            if(index === -1){
              index = this.playlist.length - 1
            }
            this.setCurrentIndex(index)
            if(!this.playing){
              this.togglePlaying()
            }          
          }
          this.songReady = false
       },
      ready() {
          this.songReady = true
          this.savePlayHistory(this.currentSong)
      },
      error() {
          this.songReady = true
      },
      onProgressBarChange(percent) {
          const currentTime = this.currentSong.duration * percent
          this.$refs.audio.currentTime = currentTime
          if(!this.playing){
             this.togglePlaying()
          }
          if(this.currentLyric){
             this.currentLyric.seek(currentTime * 1000)//偏移歌词到拖动时间的对应位置
          }
      },
      //获取解析后的歌词
      getLyric() {
          this.currentSong.getLyric().then((lyric) => {
             if(this.currentSong.lyric !== lyric){
               return
             }
             //实例化lyric对象
             this.currentLyric = new Lyric(lyric, this.handleLyric)
             //  console.log(this.currentLyric)
             if(this.playing){
                this.currentLyric.play()
             }          
          }).catch(() => { 
             //请求失败，清理数据
             this.currentLyric = null
             this.playingLyric = ''
             this.currentLineNum = 0
          })
      },
      handleLyric({lineNum, txt}){
          this.currentLineNum = lineNum
          if(lineNum > 5){
             let lineEl = this.$refs.lyricLine[lineNum - 5] //保证歌词在中间位置滚动
             this.$refs.lyricList.scrollToElement(lineEl, 1000)
          }else{
             this.$refs.lyricList.scrollTo(0, 0, 1000)//滚动到顶部
          }
          this.playingLyric = txt
      },
      //歌词滑动
      middleTouchStart(e){
          this.touch.initiated = true //初始化标志位
          const touch = e.touches[0]
          this.touch.startX = touch.pageX
          this.touch.startY = touch.pageY
      },
      middleTouchMove(e){
         if(!this.touch.initiated){
            return 
         }
         const touch = e.touches[0]
         const deltaX = touch.pageX - this.touch.startX
         const deltaY = touch.pageY - this.touch.startY
         //维护deltaY原因：歌词本身Y轴滚动，当|deltaY| > |deltaX|时，不滑动歌词
         if(Math.abs(deltaY) > Math.abs(deltaX)){ 
            return
         }
         const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
         const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX))
         this.touch.percent = Math.abs(offsetWidth / window.innerWidth)

         //滑入歌词offsetWidth = 0 + deltaX(负值)  歌词滑出offsetWidth = -innerWidth + delta(正值)
         this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
         this.$refs.lyricList.$el.style[transitionDuration] = 0
         this.$refs.middleL.style.opacity = 1 - this.touch.percent //透明度随percent改变
         this.$refs.middleL.style[transitionDuration] = 0
      },
      middleTouchEnd(){
         //优化：手动滑入滑出10%时，歌词自动滑过
         let offsetWidth
         let opacity
         if(this.currentShow === 'cd'){
            if(this.touch.percent > 0.1){
               offsetWidth = -window.innerWidth
               opacity = 0
               this.currentShow = 'lyric'
            }else{
               offsetWidth = 0
               opacity = 1
            }
         }else{
            if(this.touch.percent < 0.9){
               offsetWidth = 0
               opacity = 1
               this.currentShow = 'cd'
            }else{
              offsetWidth = -window.innerWidth
              opacity = 0
            }
         }
        const time = 300
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
        this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`
        this.$refs.middleL.style.opacity = opacity
        this.$refs.middleL.style[transitionDuration] = `${time}ms`
      },
      //获取播放时间
      updateTime(e) {
          this.currentTime = e.target.currentTime //时间戳
      },
      format(interval){
          interval = interval | 0 //向下取整
          const minute = interval / 60 | 0
          const second = this._pad(interval % 60)
          return `${minute}:${second}`
      },
      _pad(num, n = 2){ //用0补位，补2位字符串长度
          let len = num.toString().length
          while(len < n){
            num = '0' + num
            len++
          }
          return num
      },
      //控制播放列表
      showPlaylist() {
          this.$refs.playlist.show()
      },
      //获取初始位置及缩放尺寸
      _getPosAndScale(){  
         const targetWidth = 40  //mini-player icon宽度
         const width = window.innerWidth * 0.8 //cd-wrapper宽度
         const paddingLeft = 40 
         const paddingTop = 80
         const paddingBottom = 30  //mini-player icon中心距底部位置
         const scale = targetWidth / width
         const x = -(window.innerWidth / 2 - paddingLeft) //X轴方向移动的距离
         const y = window.innerHeight - paddingTop - width / 2 - paddingBottom
         return {
            x,
            y, 
            scale
         }
      },
      ...mapMutations({
        setFullScreen: 'SET_FULL_SCREEN'
      }),
      ...mapActions([
        'savePlayHistory'  
      ])
      
    },
    watch: {
      currentSong(newSong, oldSong) {
        if(!newSong.id) {
          return
        }
        if(newSong.id === oldSong.id) {
          return
        }
        if(this.currentLyric){
          this.currentLyric.stop() //切换歌曲后，清空前一首歌歌词Layric实例中的定时器
          this.currentTime = 0
          this.playingLyric = ''
          this.currentLineNum = 0
        }
        //确保DOM已存在 不使用this.$nextTick，保证手机微信中从后台切回前台时歌曲重新播放
        setTimeout(() => { 
             this.$refs.audio.play()
             //  this.currentSong.getLyric()//测试歌词
             this.getLyric()
        }, 1000)
      },
       
     playing(newPlaying){
        const audio = this.$refs.audio
        this.$nextTick(() => { //确保DOM已存在
            newPlaying ? audio.play() : audio.pause()
        })
      }
    }
}
</script>

<style lang="stylus" scoped>
  @import "../../common/stylus/variable"
  @import "../../common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px) //背景模糊
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            height: 100%
            .cd
              width: 100%
              height: 100%
              box-sizing: border-box
              border: 10px solid rgba(255, 255, 255, 0.1)
              border-radius: 50%
              &.play
                animation: rotate 20s linear infinite //CD 旋转
              &.pause
                animation-play-state: paused
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                border-radius: 50%
          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex  //flex布局
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        padding: 0 10px 0 20px
        img
          border-radius: 50%
          &.play
            animation: rotate 10s linear infinite
          &.pause
            animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>

