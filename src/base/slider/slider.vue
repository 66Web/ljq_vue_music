<template>
    <div class="slider" ref="slider">
        <div class="slider-group" ref="sliderGroup">
            <slot></slot>
        </div>
        <div class="dots">
             <span class="dot" 
                   v-for="(item, index) in dots" 
                   :key="index"
                   :class="{active: currentPageIndex === index}">
             </span>
        </div>
    </div>
</template>

<script>
import BScroll from 'better-scroll'
import {addClass} from '@/common/js/dom'

export default {
    props: {
        loop: {
            type: Boolean,
            default: true
        },
        autoPlay: {
            type: Boolean,
            default: true
        },
        interval: {
            type: Number,
            default: 4000
        }
    },
    data() {
        return {
            dots: [],
            currentPageIndex: 0
        }
    },
    mounted() {
        setTimeout(() => {
            this._setSliderWidth()
            this._initDots()  //必须保证在_initSlider前面初始化，否则this.children.length会多出两个
            this._initSlider()

            if(this.autoPlay) {
                this._play()
            }
        }, 20)

        window,addEventListener('resize',(() => {
            if(!this.slider) {
                return
            }
            this._setSliderWidth(true)
            this.slider.refresh()
        }))
    },
    destroyed() {
        clearTimeout(this.timer)
    },
    methods: {
      _setSliderWidth(isResize) {
        this.children = this.$refs.sliderGroup.children
        let width = 0
        let sliderWidth = this.$refs.slider.clientWidth
        for (let i = 0; i < this.children.length; i++) {
          let child = this.children[i]
          addClass(child, 'slider-item')
          child.style.width = sliderWidth + 'px'
          width += sliderWidth
        }
        if (this.loop && !isResize) {
          width += 2 * sliderWidth
        }
        this.$refs.sliderGroup.style.width = width + 'px'
      },
      _initSlider() {
        this.slider = new BScroll(this.$refs.slider, {
          scrollX: true,
          scrollY: false,
          momentum: false,
          snap: {
                loop: this.loop,
                threshold: 0.3,
                speed: 400
          }
        })
        this.slider.on('scrollEnd', () => {
          let pageIndex = this.slider.getCurrentPage().pageX
          if (this.loop) {
            pageIndex -= 1
          }
          this.currentPageIndex = pageIndex
          if (this.autoPlay) {
            this._play()
          }
        })
        this.slider.on('beforeScrollStart', () => {
          if (this.autoPlay) {
            clearTimeout(this.timer)
          }
        })
      },
      _initDots() {
        this.dots = new Array(this.children.length)
      },
      _play() {
        let pageIndex = this.currentPageIndex + 1
        if (this.loop) {
          pageIndex += 1
        }
        this.timer = setTimeout(() => {
          this.slider.goToPage(pageIndex, 0, 400)
        }, this.interval)
      }
    },
    methods: {
        _setSliderWidth(isResize) {
            this.children = this.$refs.sliderGroup.children
            // console.log(this.children.length)

            let width = 0
            let sliderWidth = this.$refs.slider.clientWidth
            for(let i=0; i < this.children.length; i++) {
                let child = this.children[i]
                addClass(child, 'slider-item')

                child.style.width = sliderWidth + 'px'//不要忘记加单位！
                width += sliderWidth
            }

            if(this.loop && !isResize){ //如果loop为true,BScroll的snap属性会左右克隆两个DOM，保证循环切换
                width += 2 * sliderWidth
            }

            this.$refs.sliderGroup.style.width = width + 'px'//不要忘记加单位!
        },
        _initDots() {
            // console.log(this.children.length)
            this.dots = new Array(this.children.length)
        },
        _initSlider() {
            this.slider = new BScroll(this.$refs.slider,{
                 scrollX: true,   //横向滚动
                 scrollY: false,  //禁止纵向滚动
                 momentum: false, //禁止惯性运动
                 snap: true,
                 snapLoop: this.loop, //better-scroll1.0以后没有了，使用0.1.15版本的
                 snapThreshold: 0.3,
                 snapSpeed: 400
            })

            this.slider.on('scrollEnd', () => {//每次切换到下一张之后，会派发一个scrollEnd事件
                let pageIndex = this.slider.getCurrentPage().pageX  
                if(this.loop) {
                    pageIndex -= 1
                }
                this.currentPageIndex = pageIndex

                if(this.autoPlay) {
                    clearTimeout(this.timer)
                    this._play()
                }
            })
        },
        _play() {
            let pageIndex = this.currentPageIndex + 1;//从0开始的,需要+1
            if(this.loop) {
                pageIndex += 1//loop为true时，最开始有一个复制的副本，实际的pageIndex需要+1
            }
            this.timer = setTimeout(() => {    //页面的切换，利用BScroll的接口goToPage
                this.slider.goToPage(pageIndex, 0, 400)  //参数：X方向、Y方向、时间间隔
            }, this.interval)
        }
    }
}
</script>

<style lang="stylus" scoped>
@import "../../common/stylus/variable"

  .slider
    min-height: 1px
    position: relative
    .slider-group
      position: relative
      overflow: hidden
      white-space: nowrap
      .slider-item
        float: left
        box-sizing: border-box
        overflow: hidden
        text-align: center
        a
          display: block
          width: 100%
          overflow: hidden
          text-decoration: none
        img
          display: block
          width: 100%
    .dots
      position: absolute
      right: 0
      left: 0
      bottom: 12px
      transform: translateZ(1px)
      text-align: center
      font-size: 0
      .dot
        display: inline-block
        margin: 0 4px
        width: 8px
        height: 8px
        border-radius: 50%
        background: $color-text-l
        &.active
          width: 20px
          border-radius: 5px
          background: $color-text-ll
</style>
