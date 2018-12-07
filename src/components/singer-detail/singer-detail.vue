<template>
   <transition name="slide">
      <!-- <div class="singer-detail"></div> -->
      <music-list :songs="songs" :title="title" :bg-image="bgImage"></music-list>
   </transition>
</template>

<script>
import {mapGetters} from 'vuex'
import {getSingerDetail, getMusic} from '@/api/singer'
import {ERR_OK} from '@/api/config'
import {createSong} from '@/common/js/song'
import  MusicList from '@/components/music-list/music-list'

export default {
    components: {
       MusicList
    },
    data() {
      return {
         songs: []
      }
    },
    computed: {
        title() {
           return this.singer.name
        },
        bgImage() {
           return this.singer.avatar
        },
        ...mapGetters([
           'singer'
        ])
    },
    created() {
      //  console.log(this.singer)
      this._getDetail()
    },
    methods: {
      _getDetail() {
         if(!this.singer.id){ //在歌手详情页强制刷新后，即没有获得id时，回退到歌手页面
            this.$router.push('/singer')
            return
         }
         getSingerDetail(this.singer.id).then((res) => {
            if(res.code === ERR_OK){
               // console.log(res.data.list)
               this.songs = this._normallizeSongs(res.data.list)
               // console.log(this.songs)
            }
         })
         // console.log(getSingerDetail(this.singer.id))
      },
      _normallizeSongs(list){
         let ret = []  //返回值
         list.forEach((item) => {
            let {musicData} = item   //得到music对象
            // console.log(musicData)
            //createSong必传两个参数
            if(musicData.songid && musicData.albummid){  
               // console.log(getMusic(musicData.songmid))
               getMusic(musicData.songmid).then((res) => {
                  // console.log(res)
                  if(res.code === ERR_OK){
                     // console.log(res.data)
                     const svkey = res.data.items
                     const songVkey = svkey[0].vkey
                     const newSong = createSong(musicData, songVkey)
                     ret.push(newSong)
                  }
               })
            }
         })
         // console.log(ret)
         return ret
      }
    }
}
</script>

<style lang="stylus" scoped>
    @import "../../common/stylus/variable"

   //  .singer-detail
   //     position: fixed
   //     z-index: 100 //子路由将之前的页面层盖住
   //     top: 0
   //     bottom: 0
   //     left: 0
   //     right: 0
   //     background: $color-background
    .slide-enter-active, .slide-leave-active
       transition: all 0.3s
    .slide-enter, .slide-leave-to
       transform: translate3d(100%, 0, 0)  //100% 完全移动到屏幕右侧 动画开始后向左滑入
</style>
