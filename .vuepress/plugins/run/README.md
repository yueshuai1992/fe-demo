{
  /**
   * js 库
   */
  jsLabs: Array,

  /**
   * css 库
   */
  cssLabs: Array,

  /**
   * js 字符串
   * @example: 'alert(1)'
   */
  js: [Array, String],

  /**
   * css 字符串
   * @example: 'body { color: red }'
   */
  css: [Array, String],

  /**
   * 代码编辑器和效果预览排列方式
   * 当为 false 时, 上下排列
   * 当为 true 时, 左右排列
   */
  row: {
    type: Boolean,
    default: undefined
  },

  /**
   * 当 `row` 为 true 时, 编辑区和展示区上下位置
   * 当为 false 时, 编辑器在下, 展示区在上
   * 当为 true 时, 编辑器在上, 展示区在下
   */
  reverse: Boolean,

  /**
   * 高度
   * @example: '400px'
   */
  height: String,

  /**
   * 初始加载是否打开编辑区
   * 当为 false 时, 默认是关闭编辑区
   * 当为 true 时, 默认是打开编辑区
   */
  open: Boolean,
  /**
   * 是否隐藏头部
   */
  isHideHeader: Boolean
}