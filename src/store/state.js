/**
 * 管理所有状态 state
 */
import {playMode} from '@/common/js/config'
import {loadSearch, loadPlay, loadFavorite} from '@/common/js/catch'

 const state = {
     singer: {},
     playing: false,
     fullScreen: false,
     playlist: [],
     sequenceList: [],
     mode: playMode.sequence,
     currentIndex: -1,
     disc: {},
     topList: {},
     searchHistory: loadSearch(), //获取本地缓存中的数据
     playHistory: loadPlay(),
     favoriteList: loadFavorite()
 }

 export default state