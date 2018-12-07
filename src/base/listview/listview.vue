<template>
    <scroll class="listview" 
            :data="data" 
            ref="listview" 
            :listenScroll="listenScroll"
            @scroll="scroll"
            :probeType="3">
        <ul>
           <li v-for="(group, index) in data" :key="index" class="list-group" ref="listGroup">
                <h2 class="list-group-title">{{group.title}}</h2> 
                <ul>
                  <li v-for="(item, index) in group.items" 
                      :key="index" 
                      class="list-group-item"
                      @click="selectItem(item)">
                      <img v-lazy="item.avatar" class="avatar">
                      <span class="name">{{item.name}}</span>
                  </li>
                </ul>  
           </li>
        </ul>
        <div class="list-shortcut" 
             @touchstart.stop.prevent="onShortcutTouchStart" 
             @touchmove.stop.prevent="onShortcutTouchMove">
            <ul>
               <li v-for="(item, index) in shortcutList" 
                   :key="index" 
                   class="item"
                   :data-index="index"
                   :class="{'current': currentIndex === index}">
                 {{item}}
               </li>
            </ul>
        </div>
        <div class="list-fixed" v-show="fixedTitle" ref="fixedTitle">
             <div class="fixed-title">{{fixedTitle}}</div>
        </div>
        <div class="loading-container" v-show="!data.length">
             <loading></loading> 
        </div>
    </scroll>
</template>

<script>
import Scroll from '@/base/scroll/scroll'
import {getData} from '@/common/js/dom'
import Loading from '@/base/loading/loading'

const ANCHOR_HEIGHT = 18 //通过样式设置计算得到
const TITLE_HEIGHT = 30

export default {
    components: {
        Scroll,
        Loading
    },
    props:{
      data: {
        type: Array,
        default: []
      }
    },
    data() {
      return {
        scrollY: -1,
        currentIndex: 0,  //当前显示的第几个title项 
        diff: -1  //fixed title的偏移位置
      }
    },
    computed: {
      shortcutList() {  //得到title的集合数组，‘热门’取1个字
        return this.data.map((group) => {
            return group.title.substr(0, 1) 
        })
      },
      fixedTitle() {
        if(this.scrollY > 0){
            return ''
        }
        return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
      }
    },
    created() {
       this.touch = {},
       this.listenScroll = true,
       this.listHeight = []
    },
    methods: {
       selectItem(item){
          this.$emit('select', item)
       },
       onShortcutTouchStart(e) {
          let anchorIndex = getData(e.target, 'index')//获取data-index的值  index 得到的是字符串
          let firstTouch = e.touches[0]
          this.touch.y1 = firstTouch.pageY
          this.touch.anchorIndex = anchorIndex
          this._scrollTo(anchorIndex)
       },
       onShortcutTouchMove(e) {
          let firstTouch = e.touches[0]
          this.touch.y2 = firstTouch.pageY
          let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0  //获取列表项差值，| 0 向下取整
          let anchorIndex = parseInt(this.touch.anchorIndex) + delta
          // console.log(anchorIndex)
          this._scrollTo(anchorIndex)
       },
       refresh() {
          this.$refs.listview.refresh()
       },
       scroll(pos) {
          this.scrollY = pos.y  //实时获取BScroll滚动的Y轴距离
       },
       _scrollTo(index){
          if(!index && index !== 0){
            return
          }
          if(index < 0){
            index = 0
          }else if(index > this.listHeight.length - 2){
            index = this.listHeight.length - 2
          }
          //点击时，手动得到元素上限height位置，改变scrollY, 使点击项高亮
          this.scrollY = -this.listHeight[index]  
          //第二个参数表示：要不要滚动动画缓动时间; 0 瞬间滚动
          this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0)//列表滚动定位 
       },
       _calculateHeight() {
          this.listHight = [] //每次重新计算每个group高度时，恢复初始值
          const list = this.$refs.listGroup
          let height = 0      //初始位置的height为0
          this.listHeight.push(height)
          for(let i=0; i<list.length; i++){
            let item = list[i] //得到每一个group的元素
            height += item.clientHeight //DOM元素可以用clientHeight获取元素高度
            this.listHeight.push(height)  //得到每一个元素对应的height
          }
       }  
    },
    watch: {
      data() {
        setTimeout(() => {
           this._calculateHeight()
        }, 20)
      },
      scrollY(newY) {
        const listHeight = this.listHeight
        //当滚动到顶部，newY>0
        if(newY > 0) {
          this.currentIndex = 0
          return
        }
        //在中间部分滚动，遍历到最后一个元素，保证一定有下限，listHeight中的height比元素多一个
        for(let i = 0; i < listHeight.length-1; i++){
          let height1 = listHeight[i]
          let height2 = listHeight[i+1]
          if(-newY >= height1 && -newY < height2) { 
             this.currentIndex = i
             this.diff = height2 + newY //得到fixed title上边界距顶部的偏移距离
            //  console.log(this.currentIndex)
             return
          }
        }
        //当滚动到底部，且-newY大于最后一个元素的上限
        //currentIndex 比listHeight中的height多一个, 比元素多2个
        this.currentIndex = listHeight.length - 2
      },
      diff(newVal) {
        let fixedTop = (newVal>0 && newVal<TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
        if(this.fixedTop === fixedTop){
          return 
        }
        this.fixedTop = fixedTop
        this.$refs.fixedTitle.style.transform = `translate3d(0, ${fixedTop}px, 0)` 
      }
    }
}
</script>

<style lang="stylus" scoped>
   @import "../../common/stylus/variable"

  .listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: absolute //绝对定位到右侧    
      right: 0
      top: 50%
      z-index: 30
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
    .list-fixed
      position: absolute //绝对定位到顶部
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)  
</style>
