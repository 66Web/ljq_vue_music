<template>
    <transition name="slide">
        <!-- <div class="disc">歌单详情页</div> -->
        <music-list :title="title" :bg-image="bgImage" :songs="songs"></music-list>
    </transition>
</template>

<script>
import MusicList from '@/components/music-list/music-list'
import {mapGetters} from 'vuex'
import {getSongList} from '@/api/recommend'
import {ERR_OK} from '@/api/config'
import {creatSongList} from '@/common/js/song'
import {getMusic} from '@/api/singer'

export default {
    components: {
        MusicList
    },
    computed: {
        title() {
           return this.disc.dissname
        },
        bgImage() {
           return this.disc.imgurl
        },
        ...mapGetters([
            'disc'
        ])
    },
    data() {
        return {
            songs: []
        }
    },
    created() {
        this._getSongList()
    },
    methods: {
        _getSongList () {
            if(!this.disc.dissid){ //在歌单详情页强制刷新后，即没有获得id时，回退到推荐页面
               this.$router.push('/recommend')
               return
            }
            getSongList(this.disc.dissid).then((res) => {
                if (res.code === ERR_OK) {
                this.songs = this._normalizeSongs((res.cdlist[0].songlist))
                // console.log(res)
                // console.log(res.cdlist[0].songlist)
                // console.log(this._normalizeSongs(res.cdlist[0].songlist))
                }
            })
        },
        _normalizeSongs (list) {
            let ret = []
            list.forEach((musicData) => {
                if (musicData.id && musicData.album) {
                   // ret.push(creatSongList(musicData))
                    getMusic(musicData.mid).then((res) => {
                        // console.log(res)
                        if(res.code === ERR_OK){
                           // console.log(res.data)
                           const svkey = res.data.items
                           const songVkey = svkey[0].vkey
                           const newSong = creatSongList(musicData, songVkey)
                           ret.push(newSong)
                        }
                    })
                }
            })
            return ret
        }
    }
}
</script>

<style lang="stylus" scoped>
    @import "../../common/stylus/variable"

    // .disc
    //    position: fixed
    //    z-index: 100 //子路由将之前的页面层盖住
    //    top: 0
    //    bottom: 0
    //    left: 0
    //    right: 0
    //    background: $color-background
    .slide-enter-active, .slide-leave-active
       transition: all 0.3s
    .slide-enter, .slide-leave-to
       transform: translate3d(100%, 0, 0)
</style>


