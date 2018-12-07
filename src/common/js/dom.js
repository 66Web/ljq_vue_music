/**
 * 封装一些DOM操作相关的代码
 */

export function addClass(el, className){
    if(hasClass(el, className)){
        return
    }
    // console.log(hasClass(el, className))
    let newClass = el.className.split(' ')
    newClass.push(className)
    el.className = newClass.join(' ')
}

export function hasClass(el, className){
    let reg = new RegExp('(^|\\s)' + className + '(\\s|$)')
    return reg.test(el.className)
}

export function getData(el, name, val){
    const prefix = 'data-'
    name = prefix + name
    if(val){
        return el.setAttribute(name, val)
    }else{
        return el.getAttribute(name)
    }
}

//能力检测: 查看elementStyle支持哪些特性
let elementStyle = document.createElement('div').style

//供应商: 遍历查找浏览器的前缀名称，返回对应的当前浏览器
let vendor = (() => {
    let transformNames = {
        webkit: 'webkitTransform',
        Moz: 'MozTransform',
        O: 'OTransform',
        ms: 'msTransform',
        standard: 'transform'
    }

    for (let key in transformNames) {
        if(elementStyle[transformNames[key]] !== undefined) {
            return key
        }
    }

    return false
})()

export function prefixStyle(style) {
    if(vendor === false){
        return  false
    }

    if(vendor === 'standard'){
        return style
    }

    return vendor + style.charAt(0).toUpperCase() + style.substr(1)
}