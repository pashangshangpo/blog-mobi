/**
 * @file blog to mobi
 * @author pashangshangpo
 * @createTime 2018年5月25日 下午8:00:27
 */

const url = require('url')
const { resolve } = require('path')
const JSDOM = require('jsdom')
const xmlserializer = require('xmlserializer')
const jsonToMobi = require('jsonToMobi')
const Crawler = require('html-crawler')

const processHTML = (html, url) => {
    const document = new JSDOM('<!DOCTYPE html>' + html).window.document

    const imgs = document.querySelectorAll('img')
    const resultImgs = []

    // 转换成绝对路径, 对于../之类的直接忽略并删除,因为获取不到路径
    Array.from(imgs).forEach(img => {
        const prefix = img.src.slice(0, 2)
        if (prefix === './') {
            img.src = url + img.src.slice(2)
        }
        else if (prefix.indexOf('/') > -1 && prefix !== '//') {
            img.src = url + img.src.slice(1)
        }
        else if (prefix !== '//' && img.src.indexOf('http') === -1 && prefix.indexOf('.') === -1) {
            img.src = url + img.src
        }
        else if (img.src.indexOf('http') !== 0 && img.src.indexOf('//') !== 0) {
            img.parentNode.removeChild(img)
            return
        }

        resultImgs.push(img.src)
    })

    // 过滤script,link,iframe
    Array.from(document.querySelectorAll('script,link,iframe,embed,object')).forEach(el => {
        el.parentNode.removeChild(el)
    })

    // 删除除src,href外的所有元素属性
    Array.from(document.body.querySelectorAll('*')).forEach(el => {
        Array.from(el.attributes).forEach(attr => {
            if (['src', 'href'].indexOf(attr.name) === -1) {
                el.removeAttribute(attr.name)
            }
        })
    })

    return {
        html: xmlserializer.serializeToString(document)
            .replace('<html xmlns="http://www.w3.org/1999/xhtml"><head/><body>', '')
            .replace('</body></html>', '')
            .trim(),
        imgs: resultImgs
    }
}

/**
 * @start-def: blogMobi: (name, config, outputDir) => undefined
 *   name: String 名称
 *   config: Object
 *     pageUrls: Array
 *       Item: String 页面URL
 *     decode: String 解码格式 默认utf-8
 *     getNavList: document => Array 需要返回页面导航列表
 *       Item: Object
 *         title: String 标题
 *         href: String 链接
 *     getContent: document => String 需要返回html内容
 *     getArticles: res => undefined 获取文章列表, 最终结果
 *   outputDir: String 输出文件路径
 */
module.exports = (name, config, outputDir) => {
    const getArticles = config.getArticles || (() => { })

    config.getArticles = res => {
        res = res.map(item => {
            const urlParse = url.parse(item.href)
            const processResult = processHTML(item.content, `${urlParse.protocol}//${urlParse.host}`)

            item.content = processResult.html
            item.imgs = processResult.imgs

            return item
        })

        getArticles(res)

        jsonToMobi(
            {
                name: name,
                chapters: res
            },
            outputDir || resolve('.')
        )
    }

    new Crawler(config)
}