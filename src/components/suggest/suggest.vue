<template>
    <scroll class="suggest" 
            :data="result" 
            :pullup="pullup"
            :beforeScroll="beforeScroll"
            @beforeScroll="listScroll"
            @scrollToEnd="searchMore"  
            ref="suggest">
        <ul class="suggest-list">
            <li class="suggest-item" @click="selectItem(item)" v-for="(item, index) in result" :key="index">
                <div class="icon">
                    <i :class="getIconCls(item)"></i>
                </div>
                <div class="name">
                    <p class="text" v-html="getDisplayName(item)"></p>
                </div>
            </li>
            <loading v-show="hasMore" title=""></loading>
        </ul>
        <div class="no-result-wrapper" v-show="!hasMore && !result.length">
            <no-result title="抱歉，暂无搜索结果"></no-result>
        </div>
    </scroll>
</template>

<script>
import {getSearch} from '@/api/search'
import {ERR_OK} from '@/api/config'
// import {filterSinger} from '@/common/js/song'
import {getMusic} from '@/api/singer'
import {createSong} from '@/common/js/song'
import Scroll from '@/base/scroll/scroll'
import Loading from '@/base/loading/loading'
import Singer from '@/common/js/singer'
import {mapMutations, mapActions} from 'vuex'
import NoResult from '@/base/no-result/no-result'

const TYPE_SINGER = 'singer'
const perpage = 20 //抓取数据一页有多少数据

export default {
    components: {
        Scroll,
        Loading,
        NoResult
    },
    props: {
        query: {
            type: String,
            default: ''
        },
        showSinger: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            page: 1,
            result: [],
            zhida: {},
            searchSongs: {}, //result 副本
            pullup: true,
            beforeScroll: true,
            hasMore: true,   //上拉加载标志位
            firstList: {}    //第一次搜索到的歌曲 
        }
    },
    methods: {
       search() {
            this.page = 1
            this.$refs.suggest.scrollTo(0, 0) //scroll位置重置到顶部
            this.hasMore = true  
            getSearch(this.query, this.page, this.showSinger, perpage).then((res) => {
                // console.log(res.data)
                if(res.code === ERR_OK) {
                    this.zhida = res.data.zhida
                    this.firstList = res.data.song.list
                    this.searchSongs = this._normalizeSongs(res.data.song.list) 
                    // this.result = this._genResult(this.zhida, this.searchSongs)
                    this._checkMore(res.data.song)
                }
            })    
       },
       searchMore() {
            if(!this.hasMore) {
                return
            }
            this.page++
            getSearch(this.query, this.page, this.showSinger, perpage).then((res) => {
                if(res.code === ERR_OK) {
                    //把下一页数据，拼接上原页面数据
                    this.searchSongs = this._normalizeSongs(this.firstList.concat(res.data.song.list))
                    this._checkMore(res.data.song)
                }
            })
       },
       getIconCls(item) {
          if (item.type === TYPE_SINGER) {
              return 'icon-mine'
          }else{
              return 'icon-music'
          }
       },
       getDisplayName(item) {
          if (item.type === TYPE_SINGER) {
              return item.singername
          }else{
              return `${item.name}-${item.singer}`
          }
       },
       selectItem(item) {
          if(item.type === TYPE_SINGER) {
              const singer = new Singer({
                  id: item.singermid,
                  name: item.singername
              })
              this.$router.push({
                  path: `/search/${singer.id}`
              })
              this.setSinger(singer)
          }else{
              this.insertSong(item)
          }
          this.$emit('select') 
       },
       refresh() {
          this.$refs.suggest.refresh()
       },
       listScroll() {
          this.$emit('listScroll')
       },
    //    _genResult(data) {
    //         let ret = []
    //         if(data.zhida && data.zhida.singerid) {
    //             //使用es6对象扩展运算符...把两个对象添加到一个对象上
    //             ret.push({...data.zhida, ...{type: TYPE_SINGER}})
    //         }
    //         if(data.song){
    //             // console.log(data.song.list)
    //             // ret = ret.concat(data.song.list)
    //             // 异步内部再异步 会导致数组不能操作
    //             // ret = ret.concat(this._normalizeSongs(data.song.list)) 
    //         }
    //         return ret
    //    },
        _genResult(data, newValue) {
            let ret = []
            //push歌手进空数组
            if(data.singerid) {
                //使用es6对象扩展运算符...把两个对象添加到一个对象上
                ret.push({...this.zhida, ...{type: TYPE_SINGER}})
            }
            //合并歌曲进数组
            if(newValue){
                ret = ret.concat(newValue)
            }
            this.result = ret
            // console.log(this.result)
       },
       //判断标志位的状态
       _checkMore(data) {
            if(!data.list.length || (data.curnum + data.curpage * perpage) >= data.totalnum){
                this.hasMore = false
            }
       },
       _normalizeSongs(list) {
           let ret = []
           let pushIndex =0  //标志位 判断是否是最后一次push
           list.forEach((musicData) => {
               if(musicData.songid && musicData.albumid) {
                    let songVkey = ''
                    getMusic(musicData.songmid).then((res) => {
                        // console.log(res)
                        if(res.code === ERR_OK){
                           // console.log(res.data)
                           const svkey = res.data.items
                           const songVkey = svkey[0].vkey
                           const newSong = createSong(musicData, songVkey)
                           ret.push(newSong)
                           //把歌曲源数据push后判断是否异步完成
                           pushIndex++
                           this.pushOver = list.length===pushIndex                         
                        }
                    })
                    // ret.push(createSong(musicData, songVkey))
               }
           })
           return ret
       },
       ...mapMutations({
           setSinger: 'SET_SINGER'
       }),
       ...mapActions([
           'insertSong'
       ])
    },
    watch: {
        query() {
            this.search()
        },
        //监听异步问题，对数据无法操作，把值赋值出来
        searchSongs(newValue){
            // console.log(this.pushOver)
	       //判断异步完成后去合并已存在的数组和singer
            if(this.pushOver){     
                 this._genResult(this.zhida, newValue)
            }     
        }
    }
}
</script>

<style lang="stylus" scoped>
 @import "../../common/stylus/variable"
 @import "../../common/stylus/mixin"

  .suggest
    height: 100%
    overflow: hidden
    .suggest-list
      padding: 0 30px
      .suggest-item
        display: flex
        align-items: center
        padding-bottom: 20px
      .icon
        flex: 0 0 30px
        width: 30px
        [class^="icon-"]
          font-size: 14px
          color: $color-text-d
      .name
        flex: 1
        font-size: $font-size-medium
        color: $color-text-d
        overflow: hidden
        .text
          no-wrap()
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>


