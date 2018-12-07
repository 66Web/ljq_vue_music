import jsonp from '@/common/js/jsonp'
import {commonParams, options} from './config'
import axios from 'axios';

export function getHotKey() {
    const url = "https://c.y.qq.com/splcloud/fcgi-bin/gethotkey.fcg"

    const data = Object.assign({}, commonParams, {
        platform: 'h5',
        needNewcode: 1
    })

    return jsonp(url, data, options)
}

//搜索结果数据
export function getSearch(query, page, zhida, perpage) {
    const url = "/api/getSearch"   //通过自身模拟服务器访问有host权限的数据

    const data = Object.assign({}, commonParams, {
        w: query,
        p: page,
        catZhida: zhida ? 1 : 0,
        uin: 0,
        platform: 'h5',
        needNewCode: 1,
        zhidaqu: 1,
        t: 0,
        flag: 1,
        ie: 'utf-8',
        sem: 1,
        aggr: 0,
        perpage: perpage,
        n: perpage,
        remoteplace: 'txt.mqq.all',
        format: 'json',
        _: +new Date()
    })
      
    return axios.get(url, {
           params: data
    }).then((res) => {
           return Promise.resolve(res.data)
    })
}