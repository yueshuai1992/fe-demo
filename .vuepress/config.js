const plugins = require('./config/plugins.js')
const sidebar = require('./config/sidebar')
module.exports = {
  title: "唱吧 FE DEMO",
  description: '唱吧前端业务DEMO系统',
  dest: 'public',
  head: [
    ['link', { rel: 'icon', href: 'http://changba.com/favicon.ico'}],
    ['link', { rel: 'stylesheet', href: './styles/index.styl'}],
    ['meta', { name: 'viewport', content: 'width=device-width,initial-scale=1,user-scalable=no' }]
  ],
  theme: 'reco',
  themeConfig: {
    noFoundPageByTencent: false,
    nav: [
      { text: '首页', link: '/', icon: 'reco-home' },
      { text: '时间轴', link: '/timeline/', icon: 'reco-date' },
      { text: '文档', 
        icon: 'reco-message',
        items: [
          { text: '文档', link: '/docs/' }
        ]
      },
      { text: 'GitLab', 
        icon: 'reco-message',
        items: [
          { text: 'GitLab', link: '', icon: 'reco-github' }
        ]
      }
    ],
    sidebar,  
    type: 'blog',
    // 博客设置
    blogConfig: {
      category: {
        location: 2, // 在导航栏菜单中所占的位置，默认2
        text: '分类' // 默认 “分类”
      },
      tag: {
        location: 3, // 在导航栏菜单中所占的位置，默认3
        text: '标签' // 默认 “标签”
      }
    },
    friendLink: [
      {
        title: '唱吧',
        desc: '唱吧官网',
        logo: "/logo.png",
        link: 'https://changba.com/'
      },
      {
        title: '猫爪',
        desc: '猫爪官网',
        logo: "https://maozhua.xiaochang.com/logo.png",
        link: 'https://maozhua.xiaochang.com'
      },
      {
        title: '猫爪WEEX文档',
        desc: '唱吧 猫爪项目WEEX文档',
        logo: "https://maozhua.xiaochang.com/logo.png",
        link: 'https://maozhua.xiaochang.com/weex-cb-press/'
      }
    ],
    logo: '/logo.png',
    // 搜索设置
    search: true,
    searchMaxSuggestions: 10,
    // 自动形成侧边导航
    // sidebar: 'auto',
    // 最后更新时间
    lastUpdated: 'Last Updated',
    // 作者
    author: 'changba',
    // 作者头像
    authorAvatar: '/logo.png',
    // 备案号
    record: '京ICP备11013291号-1',
    // 项目开始时间
    startYear: '2018'
    /**
     * 密钥 (if your blog is private)
     */

    // keyPage: {
    //   keys: ['your password'],
    //   color: '#42b983',
    //   lineColor: '#42b983'
    // },

    /**
     * valine 设置 (if you need valine comment )
     */

    // valineConfig: {
    //   appId: '...',// your appId
    //   appKey: '...', // your appKey
    // }
  },
  plugins,
  markdown: {
    lineNumbers: true
  }
}  
