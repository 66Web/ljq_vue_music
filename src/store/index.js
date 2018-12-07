/**
 * 初始化Vuex入口文件
 */

import Vue from 'vue'
import Vuex from 'vuex'

import * as actions from './actions'
import * as getters from './getters'
import state from './state'
import mutations from './mutations'

//Vuex 内置日志插件用于一般的调试
import createLogger from 'vuex/dist/logger'

Vue.use(Vuex)

//只在开发环境时启动严格模式
const debug = process.env.NODE_ENV !== 'production'

//工厂方法输出一个单例Vuex.Store模式
export default new Vuex.Store({
    actions,
    getters,
    state,
    mutations,
    // strict: debug,
    plugins: debug ? [createLogger()] : []
})
