<template>
  <div
    ref="wrapper"
    class="cb-vue-online"
    :style="{ 'overflow-y': isScreenfull ? 'auto' : null }"
    @mouseenter="hovering = true"
    @mouseleave="hovering = false"
  >
    <!-- header部分 -->
    <cb-header
      :title="title"
      :is-row="isRow"
      v-if="!attrs.isHideHeader"
      :is-screenfull="isScreenfull"
      :is-expanded="isExpanded"
      @reset="handleReset"
      @change-row="isRow = !isRow"
      @screenfull="handleScreenfull"
    />
    <!-- 中间主体区 -->
    <cb-main
      :is-row="isRow"
      :is-expanded="isExpanded"
      :reverse="attrs.reverse"
      :is-screenfull="isScreenfull"
    >
      <template v-slot:editor>
        <!-- 编辑器区域 -->
        <codemirror
          class="cb-vue-online-editor"
          v-model="editCode"
          @input="handleRun"
          :style="{ height: editorHeight }"
          :options="codemirrorOption"
        ></codemirror>
      </template>
      <template v-slot:preview>
        <!-- 运行结果展示 -->
        <preview
          v-if="previewShow"
          ref="preview"
          :js-labs="attrs.jsLabs"
          :theme-color="attrs.themeColor"
          :css="attrs.css"
          :js="attrs.js"
          :style="{
            borderTop:
              !isRow && !attrs.reverse && isExpanded
                ? '1px solid var(--vue-run-sfc-border, #ebeef5)'
                : ''
          }"
          :css-labs="attrs.cssLabs"
          @change-height="handlePreviewHeightChange"
          :value="preview"
        />
      </template>
    </cb-main>

    <!-- 控制是否展开代码 -->
    <control
      :is-screenfull="isScreenfull"
      :is-expanded="isExpanded"
      :hovering="hovering"
      :is-row="isRow"
      @expanded="isExpanded = !isExpanded"
    />
  </div>
</template>

<script>
import { codemirror, codemirrorOption } from "./codemirror";
import Preview from "./components/preview";
import CbHeader from "./components/header";
import Control from "./components/control";
import CbMain from "./components/main";
import cssVars from "css-vars-ponyfill";
import getImports from './utils/get-imports';
import getPkgs from './utils/get-pkgs';

const { debounce } = require("throttle-debounce");
const compiler = require("vue-template-compiler");
const screenfull = require("screenfull");
const Babel = require("@babel/standalone");

export default {
  name: "cb-vue-online",
  components: {
    CbHeader,
    Preview,
    Control,
    CbMain,
    codemirror
  },
  props: {
    /**
     * 代码
     * @example: '<template><div>123</div></template>'
     */
    code: String,

    /**
     * js 库
     * @example: ['https://unpkg.com/element-ui/lib/index.js']
     */
    jsLabs: [String, Array],

    /**
     * css 库
     * @example: ['https://unpkg.com/element-ui/lib/theme-chalk/index.css']
     */
    cssLabs: [String, Array],

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

    // 代码, 同 `code`
    value: String,

    /**
     * 主体色
     * 默认值: #409eff
     */
    themeColor: String,

    /**
     * 边框色
     * 默认值: #eaeefb
     */
    themeBorderColor: String,

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
    reverse: {
      type: Boolean,
      default: undefined
    },

    /**
     * 标题
     * @example: '测试demo'
     */
    title: String,

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
    open: {
      type: Boolean,
      default: undefined
    },

    /**
     * 是否隐藏头部
     */
    isHideHeader: {
      type: Boolean,
      default: undefined
    }
  },
  data() {
    return {
      // 当hover时
      hovering: false,
      // 是否展开编辑器
      isExpanded: false,
      // 编辑器配置
      codemirrorOption: codemirrorOption,
      // 当时是否为全屏
      isScreenfull: false,
      // 实际代码
      editCode: "",
      // 最初的代码(用于重置)
      initalCode: "",
      // 预览数据
      preview: {},
      // 预览区高度
      previewHeight: 0,
      // 布局
      isRow: null,

      // 展示
      previewShow: false
    };
  },
  computed: {
    // 全局属性配置和自定义属性配置
    attrs() {
      const globalProps = this.$_vue_run_sfc || {};
      const merge = key => {
        let globalVal = globalProps[key] || [];
        if (globalVal && !Array.isArray(globalVal)) {
          globalVal = [globalVal];
        }
        let customVal = this.$props[key] || [];
        if (customVal && !Array.isArray(customVal)) {
          customVal = [customVal];
        }
        return [...globalVal, ...customVal];
      };

      const props = Object.keys(this.$props).reduce((acc, key) => {
        if (this.$props[key] !== undefined) {
          acc[key] = this.$props[key];
        }
        return acc;
      }, {});

      return Object.assign({}, globalProps, props, {
        jsLabs: merge("jsLabs"),
        cssLabs: merge("cssLabs"),
        js: merge("js"),
        css: merge("css")
      });
    },
    // 编辑器高度, 动态计算
    editorHeight() {
      if (this.isScreenfull) {
        if (this.isRow) {
          const headerHeight = 58;
          return document.documentElement.clientHeight - headerHeight + "px";
        } else {
          return null;
        }
      } else {
        if (!this.attrs.height) {
          let editorHeight = 0;
          const minHeight = 150; // 最小高度

          if (this.isRow) {
            // 如果是并排, 则根据预览区的高度 或者 最小高度
            editorHeight =
              this.previewHeight > minHeight ? this.previewHeight : minHeight;
          } else {
            // 如果是column布局, 则按照本身的高度 或者 最小高度
            // 行高
            const lineHeight = 21;
            // 额外高度
            const extraHeight = 20;

            // 编辑区高度
            editorHeight =
              this.editCode.split(/\r\n|\r|\n/).length * lineHeight +
              extraHeight;
            // 判断
            editorHeight = editorHeight > minHeight ? editorHeight : minHeight;
          }
          return editorHeight + "px";
        } else {
          return this.attrs.height;
        }
      }
    }
  },
  methods: {
    // 全屏 (点击按钮)
    handleScreenfull() {
      this.isScreenfull = !this.isScreenfull;
      screenfull.toggle(this.$refs.wrapper);
    },
    // esc 按钮退出全屏
    checkScreenfull() {
      if (screenfull.isEnabled) {
        screenfull.on("change", () => {
          this.isScreenfull = screenfull.isFullscreen;
        });
      }
    },
    // 运行代码
    // 参考: https://github.com/QingWei-Li/vuep.run/blob/master/src/components/preview.vue
    handleRun() {
      if (!this.runCode) {
        this.runCode = debounce(300, async () => {
          const code = this.editCode;
          this.$emit("input", code);
          this.$emit("change", code);
          if (!code) {
            return;
          }

          let { template, script, styles, errors } = compiler.parseComponent(
            code
          );

          // 判断是否有错误
          if (errors && errors.length) {
            this.preview = {
              errors: errors
            };
          } else {
            // 如果 html和js 都不存在
            if (!template && !script) return;
            // 处理 css 样式(数组)
            if (window.fetch) {
              // 如果存在则从远程获取解析值
              const styleParser = require("./styleParser");
              const res = await styleParser.getStyles(styles);
              errors = res
                .filter(item => !item.success)
                .map(item => item.error);
              styles = res.filter(item => item.success).map(item => item.style);
            } else {
              // 如果不存在 window.fetch 则不考虑其它预处理器
              errors = styles
                .filter(item => item.lang)
                .map(item => `暂不支持${item.lang}预处理器`);
              styles = styles
                .filter(item => !item.lang)
                .map(item => item.content);
            }
            // 处理 template
            template = template ? JSON.stringify(template.content) : '""';

            // 处理 js
            const imports = [];
            let compiled;
            const pkgs = [];
            let scriptContent = 'exports = { default: {} }';
            if (script) {
              try {
                compiled = Babel.transform(script.content, {
                  presets: ['es2015'],
                  plugins: [
                    [getImports, { imports }]
                  ]
                }).code;
              } catch (e) {
                this.preview = {
                  errors: [e.message]
                };
                return;
              }
              scriptContent = await getPkgs(compiled, imports, pkgs);
              pkgs.forEach(pkg => {
                this.attrs.jsLabs.push(
                  `https://cdn.jsdelivr.net/npm/${pkg.module}`
                );
              });

              this.previewShow = true

              this.preview = {
                  styles,
                  script: scriptContent,
                  template,
                  errors
              };
            }
          }
        });
      }
      this.runCode();
    },
    // 重置代码
    handleReset() {
      this.editCode = this.initalCode;
      this.handleRun();
    },
    // 设置默认 row的 值
    setDefaultRow() {
      if (this.attrs.row !== undefined) {
        this.isRow = this.attrs.row;
      } else {
        // 根据宽度, 响应式处理
        const setWidth = setInterval(() => {
          if (this.$refs.wrapper) {
            const width = this.$refs.wrapper.clientWidth;
            this.isRow = width > 992;

            clearInterval(setWidth);
          }
        }, 500);
      }
    },
    handlePreviewHeightChange(height) {
      this.previewHeight = height;
    },
    init() {
      this.setDefaultRow();

      // 默认是否展开
      this.isExpanded = this.attrs.open;

      cssVars({
        variables: {
          "--vue-run-sfc-main": this.attrs.themeColor || "#409eff",
          "--vue-run-sfc-border": this.attrs.themeBorderColor || "#eaeefb"
        }
      });

      // 默认code
      let initalCode = this.code || this.value;
      initalCode = initalCode ? decodeURIComponent(initalCode) : "";
      this.initalCode = initalCode;
      this.editCode = initalCode;
    }
  },
  mounted() {
    this.checkScreenfull();
    this.init();
    this.handleRun();
  }
};
</script>

<style>
/* 主体样式 */
.cb-vue-online {
  box-sizing: border-box;
  background: white;
  color: #303133;
}
.cb-vue-online:hover {
  box-shadow: 0 0 8px 0 rgba(232, 237, 250, 0.6),
    0 2px 4px 0 rgba(232, 237, 250, 0.5);
}

/* 编辑器样式 */
.cb-vue-online-editor {
  width: 100%;
  font-size: 14px;
  line-height: 1.5em;
}
.cb-vue-online-editor .CodeMirror {
  height: inherit;
}
.cb-vue-online-editor .CodeMirror-vscrollbar {
  display: none !important;
}
.cb-vue-online-editor .CodeMirror-scrollbar-filler {
  display: none !important;
}
.cb-vue-online-editor .CodeMirror-sizer {
  padding-right: 0 !important;
}
</style>
