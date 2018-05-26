# blog-mobi
将blog文章列表转mobi书籍

目前只支持mac端

## 安装
yarn add https://github.com/pashangshangpo/blog-mobi.git --save-dev

## 使用示例

```
const blogMobi = require('blog-mobi')

blogMobi(
    'pashangshangpo',
    {
        pageUrls: [
            'http://xx.com/pages/1',
            'http://xx.com/pages/2'
        ],
        getNavList(document) {
            const list = Array.from(document.querySelectorAll('.post_content > ol > li > a'))

            return list.map(item => {
                return {
                    title: item.textContent,
                    href: item.href
                }
            })
        },
        getContent(document) {
            return document.querySelector('.post_content').innerHTML
        }
    }
)
```

## API文档

```
blogMobi: (name, config, outputDir) => undefined
  name: String 名称
  config: Object
    pageUrls: Array
      Item: String 页面URL
    decode: String 解码格式 默认utf-8
    getNavList: document => Array 需要返回页面导航列表
      Item: Object
        title: String 标题
        href: String 链接
    getContent: document => String 需要返回html内容
    getArticles: res => undefined 获取文章列表
  outputDir: String 输出文件路径
```
