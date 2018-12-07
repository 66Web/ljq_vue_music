/**
 * 构造一个Singer类
 * JavaScript constructor 属性返回对创建此对象的数组函数的引用
 */
export default class Singer {
    constructor({id, name}) {
        //将参数全部拷贝到当前实例中
        this.id = id
        this.name = name
        this.avatar = `https://y.gtimg.cn/music/photo_new/T001R300x300M000${id}.jpg?max_age=2592000`
    }
}