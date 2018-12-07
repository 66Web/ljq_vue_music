<template>
    <div class="music-list">
        <div class="back" @click="back">
            <i class="icon-back"></i>
        </div>
        <h1 class="title" v-html="title"></h1>
        <div class="bg-image" :style="bgStyle" ref="bgImage">
            <div class="play-wrapper">
                <div class="play" v-show="songs.length>0" ref="playBtn" @click="random">
                    <i class="icon-play"></i>
                    <span class="text">随机播放全部</span>
                </div>
            </div>
            <div class="filter" ref="filter"></div>
        </div>
        <div class="bg-layer" ref="layer"></div>
        <scroll :data="songs" @scroll="scroll"
            :listen-scroll="listenScroll" :probe-type="probeType" class="list" ref="list">
            <div class="song-list-wrapper">
                <song-list :songs="songs" :rank="rank" @select="selectItem"></song-list>
            </div>
        </scroll>
        <div class="loading-container" v-show="!songs.length">
            <loading></loading>
        </div>
    </div>
</template>

<script>
import Scroll from '@/base/scroll/scroll'
import SongList from '@/base/song-list/song-list'
import {prefixStyle} from '@/common/js/dom'
import Loading from '@/base/loading/loading'
import {mapActions} from 'vuex'
import {playlistMixin} from '@/common/js/mixin'

const RESERVED_HEIGHT = 40 //顶部以下偏移常量 
const transform = prefixStyle('transform')
const backdrop = prefixStyle('backdrop-filter')

export default {
     mixins: [playlistMixin],
     components: {
        Scroll,
        SongList,
        Loading
     },
     props: {
         bgImage: {
             type: String,
             default: ''
         },
         songs: {
             type: Array,
             default: []
         },
         title: {
             type: String,
             default: ''
         },
         rank: {
             type: Boolean,
             default: false
         }
     },
     data() {
         return{
            scrollY: 0
         }
     },
     computed: {
         bgStyle() {
             return `background-image: url(${this.bgImage})`
         }
     },
     created() {
        this.probeType = 3
        this.listenScroll = true
    },
     mounted() {
         //记录imageHeight，计算最远滚动位置，不超过minTranslateY
         this.imageHeight = this.$refs.bgImage.clientHeight
         this.minTranslateY = -this.imageHeight + RESERVED_HEIGHT

         //根据当前加载好的bgImage的高度，设置list的top值
         this.$refs.list.$el.style.top = `${this.$refs.bgImage.clientHeight}px`
     },
     methods: {
         handlePlaylist(playlist){
             const bottom = playlist.length > 0 ? '60px' : ''
             this.$refs.list.$el.style.bottom = bottom //底部播放器适配
             this.$refs.list.refresh() //强制scroll重新计算
         },
         scroll(pos) {
             this.scrollY = pos.y
         },
         back(){
             this.$router.back() //回退到上一级路由
         },
         selectItem(item, index){
             this.selectPlay({
                 list: this.songs,
                 index
             })
         },
         random(){
            this.randomPlay({
                list: this.songs
            })
         },
         ...mapActions([
             'selectPlay',
             'randomPlay'
         ])
     },
     watch: {
         scrollY(newY) {
             //设置最大滚动量，限制bg-layer滚动
             let translateY = Math.max(this.minTranslateY, newY) 
             this.$refs.layer.style[transform] = `translate3d(0, ${translateY}px, 0)`

             //滚动到顶部时，图片遮住文字
             let zIndex = 0
             if(newY < this.minTranslateY) {
                 zIndex = 10
                 this.$refs.bgImage.style.paddingTop = 0
                 this.$refs.bgImage.style.height = `${RESERVED_HEIGHT}px`
                 this.$refs.playBtn.style.display = 'none'
             }else{
                 this.$refs.bgImage.style.paddingTop = '70%'
                 this.$refs.bgImage.style.height = 0
                 this.$refs.playBtn.style.display = ''
             }
             
             //列表从初始位置下拉后，图片放大缩小效果
             //列表滚动到顶部时，（iphone手机中）图片有一个高斯模糊的变化
             let scale = 1
             let blur = 0
             const percent = Math.abs(newY / this.imageHeight)
             if(newY > 0) {
                scale = 1 + percent
                zIndex = 10
             }else{
                blur = Math.min(20 * percent, 20)
             }
             this.$refs.bgImage.style[transform] = `scale(${scale})`
             this.$refs.filter.style[backdrop] = `blur(${blur}px)`

             this.$refs.bgImage.style.zIndex = zIndex
         }
     }
}
</script>

<style lang="stylus" scoped>
 @import "../../common/stylus/variable"
 @import "../../common/stylus/mixin"

  .music-list
    position: fixed
    z-index: 100
    top: 0
    left: 0
    bottom: 0
    right: 0
    background: $color-background
    .back
      position absolute
      top: 0
      left: 6px
      z-index: 50
      .icon-back
        display: block
        padding: 10px
        font-size: $font-size-large-x
        color: $color-theme
    .title
      position: absolute
      top: 0
      left: 10%
      z-index: 40
      width: 80%
      no-wrap()
      text-align: center
      line-height: 40px
      font-size: $font-size-large
      color: $color-text
    .bg-image
      position: relative
      width: 100%
      height: 0
      padding-top: 70%
      transform-origin: top //从顶部放大缩小关键
      background-size: cover 
      .play-wrapper
        position: absolute
        bottom: 20px
        z-index: 50
        width: 100%
        .play
          box-sizing: border-box
          width: 135px
          padding: 7px 0
          margin: 0 auto
          text-align: center
          border: 1px solid $color-theme
          color: $color-theme
          border-radius: 100px
          font-size: 0
          .icon-play
            display: inline-block
            vertical-align: middle
            margin-right: 6px
            font-size: $font-size-medium-x
          .text
            display: inline-block
            vertical-align: middle
            font-size: $font-size-small
    .bg-layer
      position: relative
      height: 100%
      background: $color-background   
    .list
      position: fixed
      top: 0
      bottom: 0
      width: 100%
      background: $color-background
      .song-list-wrapper
        padding: 20px 30px
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
        
</style>
