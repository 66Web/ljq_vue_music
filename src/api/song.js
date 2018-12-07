import {commonParams} from './config'
import axios from 'axios'

export function getLyric(mid){
    const url = '/api/lyric'

    const data = Object.assign({}, commonParams, {
        songmid: mid,
        pcachetime: +new Date(),
        platform: 'yqq',
        hostUin: 0,
        needNewCode: 0,
        g_tk: 5381, //会变化，以实时数据为准
        format: 'json' //规定为json请求
    })

    return axios.get(url, {
        params: data
    }).then((res) => {
        return Promise.resolve(res.data)
    })
}