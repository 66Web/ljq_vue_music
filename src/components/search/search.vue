<template>
    <div class="search">
        <div class="search-box-wrapper">
            <search-box ref="searchBox" @query="onQueryChange"></search-box>
        </div>
        <div class="shortcut-wrapper" v-show="!query" ref="shortcutWrapper">
             <scroll :refreshDelay="refreshDelay" ref="shortcut" class="shortcut" :data="shortcut">
                 <div>
                    <div class="hot-key">
                        <h1 class="title">热门搜索</h1>
                        <ul>
                            <li @click="addQuery(item.k)" class="item" v-for="(item, index) in hotKey" :key="index">
                                <span>{{item.k}}</span>
                            </li>
                        </ul>
                    </div>
                    <div class="search-history" v-show="searchHistory.length">
                        <h1 class="title">
                            <span class="text">搜索历史</span>
                            <span class="clear" @click="showConfirm">
                                <i class="icon-clear"></i>
                            </span>
                        </h1>
                        <search-list :searches="searchHistory" @select="addQuery" @delete="deleteSearchHistory"></search-list>
                    </div>
                 </div>
            </scroll>
        </div>
        <div class="search-result" v-show="query" ref="searchResult">
            <suggest :query="query" @listScroll="blurInput" @select="saveSearch" ref="suggest"></suggest>
        </div>
        <confirm ref="confirm" text="是否清空所有搜索历史"  confirmBtnText="清空"
                 @confirm="clearSearchHistory"></confirm>
        <router-view></router-view>
    </div>
</template>


<script>
import SearchBox from '@/base/search-box/search-box'
import {getHotKey} from '@/api/search'
import {ERR_OK} from '@/api/config'
import Suggest from '@/components/suggest/suggest'
import {mapActions} from 'vuex'
import SearchList from '@/base/search-list/search-list'
import Scroll from '@/base/scroll/scroll'
import {playlistMixin, searchMixin} from '@/common/js/mixin'
import Confirm from '@/base/confirm/confirm'

export default {
     name: 'search',
     mixins: [playlistMixin, searchMixin],
     components: {
         SearchBox,
         Suggest,
         SearchList,
         Scroll,
         Confirm
     },
     data() {
         return {
             hotKey: []
         }
     },
     created() {
         this._getHotKey()
     },
     computed: {
         shortcut() {
             return this.hotKey.concat(this.searchHistory)
         }
     },
     methods: {
         handlePlaylist(playlist){
             const bottom = playlist.length > 0 ? '60px' : ''
             this.$refs.shortcutWrapper.style.bottom = bottom
             this.$refs.shortcut.refresh()
             this.$refs.searchResult.style.bottom = bottom
             this.$refs.suggest.refresh()
         },
        //  deleteAll() {
        //      this.clearSearchHistory()
        //  },
         showConfirm() {
             this.$refs.confirm.show()
         },
         _getHotKey() {
             getHotKey().then((res) => {
                 if(res.code === ERR_OK){
                    // console.log(res.data.hotkey)
                    this.hotKey = res.data.hotkey.slice(0, 10)
                 }
             })
         },
         ...mapActions([
             'clearSearchHistory'
         ])
     },
     watch: {
      query(newQuery) {
        if (!newQuery) {
          setTimeout(() => {
            this.$refs.shortcut.refresh()
          }, 20)
        }
      }
    }
}
</script>


<style lang="stylus" scoped>
  @import "../../common/stylus/variable"
  @import "../../common/stylus/mixin"

  .search
    .search-box-wrapper
      margin: 20px
    .shortcut-wrapper
      position: fixed
      top: 178px
      bottom: 0
      width: 100%
      .shortcut
        height: 100%
        overflow: hidden
        .hot-key
          margin: 0 20px 20px 20px
          .title
            margin-bottom: 20px
            font-size: $font-size-medium
            color: $color-text-l
          .item
            display: inline-block
            padding: 5px 10px
            margin: 0 20px 10px 0
            border-radius: 6px
            background: $color-highlight-background
            font-size: $font-size-medium
            color: $color-text-d
        .search-history
          position: relative
          margin: 0 20px
          .title
            display: flex
            align-items: center
            height: 40px
            font-size: $font-size-medium
            color: $color-text-l
            .text
              flex: 1
            .clear
              extend-click()
              .icon-clear
                font-size: $font-size-medium
                color: $color-text-d
    .search-result
      position: fixed
      width: 100%
      top: 178px
      bottom: 0
</style>