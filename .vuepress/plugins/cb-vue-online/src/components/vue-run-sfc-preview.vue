<template>
  <div ref="preview" class="vue-run-sfc-preview">
    <vue-element-loading
      :active="loading"
      spinner="spinner"
      :color="themeColor"
    />

    <div ref="iframe"></div>
  </div>
</template>

<script>
import Vue from "vue";
import VueElementLoading from "vue-element-loading";
import createIframe from '../utils/iframe';

const sandboxAttributes = [
  'allow-modals',
  'allow-forms',
  'allow-pointer-lock',
  'allow-popups',
  'allow-same-origin',
  'allow-scripts'
];

export default {
  components: {
    VueElementLoading
  },

  data() {
    return {
      loading: true
    }
  },

  props: {
    value: {
      type: Object,
      required: true
    },
    themeColor: {
      type: String,
      default: "#409eff"
    }
  },

  mounted() {
    this.iframe = createIframe({
      el: this.$refs.iframe,
      sandboxAttributes
    });
  },

  watch: {
    value(val) {
      this.iframe.setHTML(val);
      this.loading = false
    }
  }
};
</script>