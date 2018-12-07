import jsonp from '@/common/js/jsonp'
import {commonParams, options} from '@/api/config'
import axios from 'axios';

/**
 * data: 固定参数，不知道含义，但一定要与接口保持一致
 */

export function getRecommend() {
    const url = 'https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg'
    
    const data = Object.assign({}, commonParams, {
        platfrom: 'h5',
        uin: 0,
        needNewCode: 1
    })

    return jsonp(url, data, options)
}

export function getDiscList() {
    // const url = 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg'
    const url = '/api/getDiscList'  //调用自定义的接口

    const data = Object.assign({}, commonParams, {
        platform: 'yqq',
        hostUin: 0,
        sin: 0,
        ein: 29,
        sortId: 5,
        needNewCode: 0,
        categoryId: 10000000,
        rnd: Math.random(),
        format: 'json'    //使用的时axios,所以format使用的是json,不是jsonp
    })

    // return jsonp(url, data, options)
    return axios.get(url, {
        params: data
    }).then((res) => {
        return Promise.resolve(res.data) //es6新语法，返回一个以给定值解析后的Promise对象
    })
}

export function getSongList (disstid) {
    const url = '/api/getSongList'
  
    const data = Object.assign({}, commonParams, {
      uin: 0,
      format: 'json',
      notice: 0,
      needNewCode: 1,
      new_format: 1,
      pic: 500,
      disstid, //关键数据
      type: 1,
      json: 1,
      utf8: 1,
      onlysong: 0,
      picmid: 1,
      nosign: 1,
      song_begin: 0,
      platform: 'h5',
      song_num: 100,
      _: +new Date()
    })
  
    return axios.get(url, {
      params: data
    }).then((res) => {
      return Promise.resolve(res.data)
    })
  }
