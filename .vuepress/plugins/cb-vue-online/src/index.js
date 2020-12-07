import VueRunSfc from "./vue-run-sfc";
import toasted from 'vue-toasted';
console.log(toasted);

const install = function(Vue, options = {}) {
  Vue.component("vue-run-sfc", VueRunSfc);
  Vue.prototype.$_vue_run_sfc = options;
};

if (typeof window !== "undefined" && window.Vue) {
  install(window.Vue);
}

export default {
  install
};

export { VueRunSfc };
