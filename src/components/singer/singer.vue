<template>
    <div class="singer" ref="singer">
        <listview :data="singers" @select="selectSinger" ref="list"></listview>
        <router-view></router-view>
    </div>
</template>


<script>
import {getSingerList} from '@/api/singer'
import {ERR_OK} from '@/api/config'
import Singer from '@/common/js/singer'
import Listview from '@/base/listview/listview'
import {mapMutations} from 'vuex'
import {playlistMixin} from '@/common/js/mixin'

const HOT_NAME = '热门'
const HOT_SINGER_LEN = 10

export default {
    mixins: [playlistMixin],
    components: {
        Listview
    },
    data() {
        return {
           singers:[]
        }   
    },
    created() {
        this._getSingerList()
    },
    methods: {
        handlePlaylist(playlist){
             const bottom = playlist.length > 0 ? '60px' : ''
             this.$refs.singer.style.bottom = bottom //底部播放器适配
             this.$refs.list.refresh() //强制scroll重新计算
        },
        selectSinger(singer){
           this.$router.push({
               path: `/singer/${singer.id}`
           })
           this.setSinger(singer)//实现对mutation的提交，向state写入数据
        },
        _getSingerList() {
            getSingerList().then((res) => {
                 if(res.code === ERR_OK) {
                    //  console.log(res.data.list)
                    //  this.singers = res.data.list
                    //  console.log(this._normalizeSinger(this.singers))
                    this.singers = this._normalizeSinger(res.data.list)
                 }
            })             
        },
        _normalizeSinger(list){
            let map = {
                hot: {
                    title: HOT_NAME,
                    items: []
                }
            }
            list.forEach((item, index) => {
                if(index < HOT_SINGER_LEN) {
                    map.hot.items.push(new Singer({
                        id: item.Fsinger_mid,
                        name: item.Fsinger_name
                    }))
                }   
                //根据Findex作聚类
                const key = item.Findex
                if(!map[key]) {
                    map[key] = {
                       title: key,
                       items: []
                    }
                }
                map[key].items.push(new Singer({
                    id: item.Fsinger_mid,
                    name: item.Fsinger_name
                })) 
            })
            // console.log(map)
            //为了得到有序列表，需要处理map
            let hot = []
            let ret = []
            for(let key in map){
                let val = map[key]
                if(val.title.match(/[a-zA-Z]/)) {
                    ret.push(val)
                }else if(val.title === HOT_NAME) {
                    hot.push(val)
                }
            }
            //为ret数组进行A-Z排序
            ret.sort((a, b) => {
                return a.title.charCodeAt(0) - b.title.charCodeAt(0)
            })

            return hot.concat(ret)
        },
        ...mapMutations({  
            setSinger: 'SET_SINGER' //把mutation的修改映射为一个方法名setSinger
        })
    }
}
</script>


<style lang="stylus" scoped>
    .singer
        position: fixed
        top: 88px
        bottom: 0
        width: 100%
</style>