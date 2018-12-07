<template>
    <div ref="wrapper">
        <slot></slot>
    </div>
</template>

<script>
import BScroll from 'better-scroll'

export default {
    props: {
        //probeType: 1 滚动的时候会派发scroll事件，会截流。2 滚动的时候实时派发scroll事件，不会截流 3 除了实时派发scroll事件，在swipe的情况下仍然能实时派发scroll事件
        probeType: {  
            type: Number, 
            default: 1 
        },
        click: {
            type: Boolean,
            default: true
        },
        data: {
            type: Array,
            default: null
        },
        listenScroll: {
            type: Boolean,
            default: false
        },
        //上拉刷新
        pullup: {
            type: Boolean,
            default: true
        },
        //是否派发beforeScroll事件
        beforeScroll: {
            type: Boolean,
            default: false
        },
        refreshDelay: {
            type: Number,
            default: 20
        }
    },
    mounted() {
        setTimeout(() => {  //确保DOM已经渲染
            this. _initScroll()
        }, 20)
    },
    methods: {
        _initScroll() {
            if(!this.$refs.wrapper){
                return
            }
            this.scroll = new BScroll(this.$refs.wrapper, {
                probeType : this.probeType,
                click: this.click
            })

            if(this.listenScroll) {
                let me = this            //箭头函数中代理this
                this.scroll.on('scroll', (pos) => {  //监听scroll事件，拿到pos位置对象：有x和y属性
                    me.$emit('scroll', pos)
                })
            }

            if(this.pullup) { 
               this.scroll.on('scrollEnd', () => {
                    // 当滚动距离小于等于最大的滚动条的距离 + 50 的时候，向外传递一个scrollToEnd的事件
                    if(this.scroll.y <= (this.scroll.maxScrollY + 50)) { 
                        this.$emit('scrollToEnd')
                    }
               })
            }

            if(this.beforeScroll) {
                this.scroll.on('beforeScrollStart', () => {
                    this.$emit('beforeScroll')
                })
            }
        },
        enable() {
            // 启用 better-scroll，默认开启
            this.scroll && this.scroll.enable()
        },
        disable() {
            // 禁用better-scroll, 如果不加，scroll的高度会高于内容的高度
            this.scroll && this.scroll.disable()
        },
        refresh() {
            // 强制 scroll 重新计算，当 better-scroll 中的元素发生变化的时候调用此方法
            this.scroll && this.scroll.refresh()
        },
        scrollTo() {
            // 滚动到指定的位置；这里使用apply 将传入的参数，传入到this.scrollTo()
            this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments)
        },
        scrollToElement() {
            // 滚动到指定的目标元素
            this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments)
        }
    },
    watch: {
        data() { //监测data的变化
            setTimeout(() => {
                this.refresh()
            }, this.refreshDelay)
        }
    }
}
</script>

<style lang="stylus" scoped>

</style>
