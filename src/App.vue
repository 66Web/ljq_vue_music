<template>
  <div id="app">
      <m-header></m-header>
      <tab></tab>
      <keep-alive>
         <router-view></router-view>
      </keep-alive> 
      <player></player>  
  </div>
</template>

<script>
import MHeader from '@/components/m-header/m-header'
import Tab from '@/components/tab/tab'
import Player from '@/components/player/player'

export default {
  name: 'App',
  components: {
     MHeader,
     Tab,
     Player
  }
}
</script>

<style lang="stylus" scoped>
    @import 'common/stylus/variable'

    #app
       color: $color-theme
</style>

