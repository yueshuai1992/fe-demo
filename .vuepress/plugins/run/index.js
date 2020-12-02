const path = require('path')
module.exports = function (options, context) {
  return  {
    name: 'vuepress-plugin-cb-run',
    enhanceAppFiles: [
      path.resolve(__dirname, 'enhanceAppFile.js'),
    ],
    extendMarkdown: function extendMarkdown(md) {
      md.use(require('markdown-it-container'), 'cb', {
        render: function render(tokens, idx) {
          const start = tokens[idx]
          const { nesting, info } = start
          if (nesting === -1) {
            return '</vuepress-run>\n'
          }

          let customOptions = info.match(/\{.*?\}/)
          if (customOptions) {
            try {
              // eslint-disable-next-line no-new-func
              customOptions = new Function(`return ${customOptions[0]}`)()
            } catch(err) {
              customOptions = {}
            }
          }

          const attrs = Object.assign({}, { themeColor: '#3eaf7c', themeBorderColor: '#eaecef' }, options, customOptions)

          let htmlStr = ''
          let lastLine = 0

          for (let index = idx; index < tokens.length; index++) {
            const { map, type, content } = tokens[index]
            if (type === 'container_run_close') break
            if (map) {
              const delta = map[0] - (lastLine || map[1])
              if (delta > 0) {
                htmlStr += '\n'.repeat(delta)
              }
              lastLine = map[1]
            }
            htmlStr += content
          } 
          return `<vuepress-run v-bind='${JSON.stringify(attrs)}' code="${encodeURIComponent(htmlStr)}">`
          // return "<div>66666</div>"
        },
      })
    },
  }
}