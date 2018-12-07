<template>
    <div class="progress-bar" ref="progressBar" @click="progressClick">
       <div class="bar-inner">
           <div class="progress" ref="progress"></div>
           <div class="progress-btn-wrapper" ref="progressBtn"
                @touchstart.prevent="progressTouchStart"
                @touchmove.prevent="progressTouchMove"
                @touchend="progressTouchEnd">
                <div class="progress-btn"></div>
           </div>
       </div>
    </div>
</template>

<script>
import {prefixStyle} from '@/common/js/dom' 

const transform = prefixStyle('transform')
const progressBtnWidth = 16

export default {
    props: {
        percent: {
            type: Number,
            default: 0
        }
    },
    created(){
        this.touch = {}
    },
    methods: {
        progressTouchStart(e) {
            this.touch.initiated = true //标志位 表示初始化
            this.touch.startX = e.touches[0].pageX //当前拖动点X轴位置
            this.touch.left = this.$refs.progress.clientWidth //当前进度条位置
        },
        progressTouchMove(e) {
            if(!this.touch.initiated){
                return
            }
            const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
            const deltaX = e.touches[0].pageX - this.touch.startX //拖动偏移量
            const offsetWidth = Math.min(barWidth, Math.max(0, this.touch.left + deltaX))
            this._offset(offsetWidth)
        },
        progressTouchEnd() {
            this.touch.initiated = false
            this._triggerPercent()
        },
        progressClick(e) {
            const rect = this.$refs.progressBar.getBoundingClientRect()
            const offsetWidth = e.pageX - rect.left
            this._offset(offsetWidth)
            //点击progressBtn 获取e.offset不对
            //this._offset(e.offsetX) 
            this._triggerPercent()
        },
        _triggerPercent(){
            const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
            const percent = this.$refs.progress.clientWidth / barWidth
            this.$emit('percentChange', percent)
        },
        _offset(offsetWidth){
            this.$refs.progress.style.width = `${offsetWidth}px` //进度条偏移
            this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px, 0, 0)` //小球偏移
        }
    },
    watch: {
        percent(newPercent) {
            if(newPercent >= 0 && !this.touch.initiated){
                const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
                const offsetWidth = newPercent * barWidth
                this._offset(offsetWidth)
            }
        }
    }
}
</script>

<style lang="stylus" scoped>
  @import "../../common/stylus/variable"

  .progress-bar
    height: 30px
    .bar-inner
      position: relative
      top: 13px
      height: 4px
      background: rgba(0, 0, 0, 0.3)
      .progress
        position: absolute
        height: 100%
        background: $color-theme
      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px  //按钮宽度16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background: $color-theme
</style>

