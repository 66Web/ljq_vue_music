'use strict'
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const path = require('path')
const baseWebpackConfig = require('./webpack.base.conf')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const portfinder = require('portfinder')

//定义路由
const express = require('express')
const axios = require('axios')
const app = express()
var apiRoutes = express.Router()
app.use('/api', apiRoutes)

const HOST = process.env.HOST
const PORT = process.env.PORT && Number(process.env.PORT)

const devWebpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap, usePostCSS: true })
  },
  // cheap-module-eval-source-map is faster for development
  devtool: config.dev.devtool,

  // these devServer options should be customized in /config/index.js
  devServer: {
    clientLogLevel: 'warning',
    historyApiFallback: {
      rewrites: [
        { from: /.*/, to: path.posix.join(config.dev.assetsPublicPath, 'index.html') },
      ],
    },
    hot: true,
    contentBase: false, // since we use CopyWebpackPlugin.
    compress: true,
    host: HOST || config.dev.host,
    port: PORT || config.dev.port,
    open: config.dev.autoOpenBrowser,
    overlay: config.dev.errorOverlay
      ? { warnings: false, errors: true }
      : false,
    publicPath: config.dev.assetsPublicPath,
    proxy: config.dev.proxyTable,
    quiet: true, // necessary for FriendlyErrorsPlugin
    watchOptions: {
      poll: config.dev.poll,
    },
    before(app) {
      //定义getDiscList接口，回调传入两个参数，前端请求这个接口
      app.get('/api/getDiscList', function(req, res){
        var url = "https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg"
        axios.get(url, {
           headers: {  //通过node请求QQ接口，发送http请求时，修改referer和host
             referer: 'https://y.qq.com/',
             host: 'c.y.qq.com'
           },
           params: req.query //把前端传过来的params，全部给QQ的url
        }).then((response) => {   //成功回调
           res.json(response.data)   //response是QQ接口返回的，res是我们自己的。所以要把数据输出给浏览器前端
        }).catch((e) => {
           console.log(e)
        })
      })

      app.get('/api/music', function(req, res){//获取vkey
        var url="https://c.y.qq.com/base/fcgi-bin/fcg_music_express_mobile3.fcg"

        axios.get(url, {
          headers: {  //通过node请求QQ接口，发送http请求时，修改referer和host
            referer: 'https://y.qq.com/',
            host: 'c.y.qq.com'
          },
          params: req.query //把前端传过来的params，全部给QQ的url
          }).then((response) => { 
               res.json(response.data)
          }).catch((e) => {
               console.log(e)
        })
      })

      app.get('/api/lyric', function(req, res){
        var url="https://szc.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg"

        axios.get(url, {
          headers: {  //通过node请求QQ接口，发送http请求时，修改referer和host
            referer: 'https://y.qq.com/',
            host: 'c.y.qq.com'
          },
          params: req.query //把前端传过来的params，全部给QQ的url
          }).then((response) => { 
              //  res.json(response.data)
              //将QQ返回的jsonp文件转换为json格式
               var ret = response.data
               if (typeof ret === 'string') {
                   var reg = /^\w+\(({[^()]+})\)$/
                   // 以单词a-z，A-Z开头，一个或多个
                   // \(\)转义括号以（）开头结尾
                   // （）是用来分组
                   // 【^()】不以左括号/右括号的字符+多个
                   // {}大括号也要匹配到
                   var matches = ret.match(reg)
                   if (matches) {
                       ret = JSON.parse(matches[1])
                       // 对匹配到的分组的内容进行转换
                   }
              }
              res.json(ret)
          }).catch((e) => {
               console.log(e)
        })
      })

      app.get('/api/getSongList', function (req, res) {
        var url = 'https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg'
        axios.get(url, {
          headers: {
            referer: 'https://y.qq.com/',
            host: 'c.y.qq.com'
          },
          params: req.query
        }).then((response) => {
          res.json(response.data)
        }).catch((e) => {
          console.log(e)
        })
      })

      app.get('/api/getSearch', function (req, res) {
        var url = 'https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp'
        axios.get(url, {
          headers: {
            referer: 'https://c.y.qq.com/',
            host: 'c.y.qq.com'
          },
          params: req.query
        }).then((response) => {
          res.json(response.data)
        }).catch((e) => {
          console.log(e)
        })
      }) 

    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': require('../config/dev.env')
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
    new webpack.NoEmitOnErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true
    }),
    // copy custom static assets
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: config.dev.assetsSubDirectory,
        ignore: ['.*']
      }
    ])
  ]
})

module.exports = new Promise((resolve, reject) => {
  portfinder.basePort = process.env.PORT || config.dev.port
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err)
    } else {
      // publish the new Port, necessary for e2e tests
      process.env.PORT = port
      // add port to devServer config
      devWebpackConfig.devServer.port = port

      // Add FriendlyErrorsPlugin
      devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
        compilationSuccessInfo: {
          messages: [`Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`],
        },
        onErrors: config.dev.notifyOnErrors
        ? utils.createNotifierCallback()
        : undefined
      }))

      resolve(devWebpackConfig)
    }
  })
})
