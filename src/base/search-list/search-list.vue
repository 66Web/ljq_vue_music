<template>
    <div class="search-list" v-show="searches.length">
       <transition-group name="list" tag="ul">
           <li @click="selectItem(item)" class="search-item" v-for="(item, index) in searches" :key="index">
               <span class="text">{{item}}</span>
               <span class="icon" @click.stop.prevent="deleteOne(item)">
                   <i class="icon-delete"></i>
               </span>
           </li>
       </transition-group>
    </div>
</template>

<script>
export default {
    props: {
        searches: {
            type: Array,
            default: []
        }
    },
    methods: {
        selectItem(item) {
            this.$emit('select', item)
        },
        deleteOne(item) {
            this.$emit('delete', item)
        }
    }
}
</script>

<style lang="stylus" scoped>
  @import "../../common/stylus/variable"

  .search-list
    .search-item
      display: flex
      align-items: center
      height: 40px
      overflow: hidden
      &.list-enter-active, &.list-leave-active
        transition: all 0.1s
      &.list-enter, &.list-leave-to
        height: 0
      .text
        flex: 1
        color: $color-text-l
      .icon
        extend-click()
        .icon-delete
          font-size: $font-size-small
          color: $color-text-d
</style>
