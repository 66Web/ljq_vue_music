<template>
    <div class="recommend" ref="recommend">
        <scroll ref="scroll" class="recommend-content" :data="discList">
            <div>  
                <div v-if="recommends.length" class="slide-wrapper">
                    <slider>
                        <div v-for="(item, index) in recommends" :key="index">
                            <a :href="item.linkUrl">
                                <img class="needsclick" :src="item.picUrl"  @load="loadImage">
                            </a>
                        </div>
                    </slider>               
                </div>
                <div class="recommend-list">
                    <h1 class="list-title">热门歌单推荐</h1>
                    <ul>
                        <li @click="selectItem(item)" v-for="(item, index) in discList" :key="index" class="item">
                            <div class="icon">
                                <img v-lazy="item.imgurl" width="60" height="60">
                            </div>
                            <div class="text">
                                <h2 class="name" v-html="item.creator.name"></h2>
                                <p class="desc" v-html="item.dissname"></p>
                            </div>
                        </li>    
                    </ul>
                </div>
            </div> 
            <div class="loading-container" v-show="!discList.length">
                <loading></loading>
            </div>
        </scroll>
        <router-view></router-view>
    </div>
</template>


<script>
import Scroll from '@/base/scroll/scroll'
import {getRecommend,getDiscList} from '@/api/recommend'
import {ERR_OK} from '@/api/config'
import Slider from '@/base/slider/slider'
import Loading from '@/base/loading/loading'
import {playlistMixin} from '@/common/js/mixin'
import {mapMutations} from 'vuex'

export default {
    mixins: [playlistMixin],
    components: {
       Slider,
       Scroll,
       Loading
    },
    data() {
        return {
            recommends: [],
            discList: []
        }
    },
    created() {  
        this._getRecommend();
        this._getDiscList();  
    },
    methods: {
        handlePlaylist(playlist){
             const bottom = playlist.length > 0 ? '60px' : ''
             this.$refs.recommend.style.bottom = bottom //底部播放器适配
             this.$refs.scroll.refresh() //强制scroll重新计算
        },
        loadImage() {
            if(!this.checkloaded){
                this.checkloaded = true
                this.$refs.scroll.refresh()
            }
        },
        selectItem (item) {
            this.$router.push({
                path: `/recommend/${item.dissid}`
            })
            this.setDisc(item)
        },
        _getRecommend() {
            getRecommend().then((res) => {
                if(res.code === ERR_OK) {
                    // console.log(res.data.slider)
                    this.recommends = res.data.slider
                }
            })
        },
        _getDiscList() {
            getDiscList().then((res) => {
                if(res.code === ERR_OK) {
                    // console.log(res.data.list)
                    this.discList = res.data.list
                }
            })
        },
        ...mapMutations({
            setDisc: 'SET_DISC'
        })
    }
}
</script>


<style lang="stylus" scoped>
@import "../../common/stylus/variable"

  .recommend
    position: fixed
    width: 100%
    top: 88px
    bottom: 0
    .recommend-content
      height: 100%
      overflow: hidden
      .slider-wrapper
        position: relative
        width: 100%
        overflow: hidden
      .recommend-list
        .list-title
          height: 65px
          line-height: 65px
          text-align: center
          font-size: $font-size-medium
          color: $color-theme
        .item
          display: flex 
          box-sizing: border-box
          align-items: center //水平方向居中
          padding: 0 20px 20px 20px
          .icon
            flex: 0 0 60px
            width: 60px
            padding-right: 20px
          .text
            display: flex
            flex-direction: column  //纵向排列
            justify-content: center  //垂直居中
            flex: 1
            line-height: 20px
            overflow: hidden
            font-size: $font-size-medium
            .name
              margin-bottom: 10px
              color: $color-text
            .desc
              color: $color-text-d
      .loading-container
          position: absolute 
          width: 100%
          top: 50%
          transform: translateY(-50%)              
</style>