/**
 * 构造一个Song类
 * JavaScript constructor 属性返回对创建此对象的数组函数的引用
 * 
 * 设计为类而不是对象的好处：
 * 1.可以把代码集中的一个地方维护
 * 2.类的扩展器比对象的扩展器强很多，而且它是一种面向对象的编程方式
 */

 import {getLyric} from '@/api/song'
 import {ERR_OK} from '@/api/config'
 import {Base64} from 'js-base64'

 export default class Song {
    constructor({id, mid, singer, name, album, duration, image, url}){
        this.id = id
        this.mid = mid
        this.singer = singer
        this.name = name
        this.album = album
        this.duration = duration
        this.image = image
        this.url = url
    }

    getLyric() {
        if(this.lyric){
            return Promise.resolve()
        }

        return new Promise((resolve, reject) => {
            getLyric(this.mid).then((res) => {
                if(res.retcode === ERR_OK){
                    this.lyric = Base64.decode(res.lyric)//解码 得到字符串
                    // console.log(this.lyric)
                    resolve(this.lyric)
                }else{
                    reject('no lyric')
                }
            })
        })
    }
 }

 //抽象出一个工厂方法：传入musicData对象参数，实例化一个Song
 export function createSong(musicData, songVkey){
     return new Song({
         id: musicData.songid,
         mid: musicData.songmid,
         singer: filterSinger(musicData.singer),
         name: musicData.songname,
         album: musicData.albumname,
         duration: musicData.interval, //歌曲时长s
         image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`,
         // url: `http://ws.stream.qqmusic.qq.com/${musicData.songid}.m4a?fromtag=46`  
         //注意guid以实时数据为主
         url: `http://ws.stream.qqmusic.qq.com/C400${musicData.songmid}.m4a?vkey=${songVkey}&guid=6319873028&uin=0&fromtag=66`
    })
 }

 //格式化处理singer数据
 export function filterSinger(singer){
     let ret = []
     if(!singer){
         return ''
     }
     singer.forEach((s) => {
         ret.push(s.name)
     })
     return ret.join('/')
 }

 export function creatSongList (musicData, songVkey) {
    return new Song({
      id: musicData.id,
      mid: musicData.mid,
      singer: filterSinger(musicData.singer),
      name: musicData.name,
      album: musicData.albumname,
      duration: musicData.interval,
      image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.album.mid}.jpg?max_age=2592000`,
      //注意guid以实时数据为主
      url: `http://ws.stream.qqmusic.qq.com/C400${musicData.mid}.m4a?vkey=${songVkey}&guid=6319873028&uin=0&fromtag=66`
    })
  }
 