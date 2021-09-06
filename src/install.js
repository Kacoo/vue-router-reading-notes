// 引入 router-view 组件
import View from "./components/view";
// 引入 router-link 组件
import Link from "./components/link";

// todo
// 这里为什么要在外面暴露一个 _Vue 呢？
export let _Vue;

// 这里开始实现插件函数
// install 函数的第一个参数是 Vue 构造函数，第二个参数是可选的选项对象 options，此处没有可选选项
export function install(Vue) {
  // 判断 vue-router 是否已经注册，已注册的话直接 return
  if (install.installed && _Vue === Vue) return;

  // todo
  // 为啥要给 install 这个函数直接加上是否注册的属性呢？
  install.installed = true;

  _Vue = Vue;

  // 判断某个变量是否已声明并赋值
  const isDef = (v) => v !== undefined;

  // todo
  // 妈呀递归函数，一看我就看不懂= =
  // 字面意思是 注册实例
  const registerInstance = (vm, callVal) => {
    let i = vm.$options._parentVnode;
    if (
      isDef(i) &&
      isDef((i = i.data)) &&
      isDef((i = i.registerRouteInstance))
    ) {
      i(vm, callVal);
    }
  };

  Vue.mixin({
    beforeCreate() {
      if (isDef(this.$options.router)) {
        this._routerRoot = this;
        this._router = this.$options.router;
        this._router.init(this);
        Vue.util.defineReactive(this, "_route", this._router.history.current);
      } else {
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this;
      }
      registerInstance(this, this);
    },
    destroyed() {
      registerInstance(this);
    },
  });

  Object.defineProperty(Vue.prototype, "$router", {
    get() {
      return this._routerRoot._router;
    },
  });

  Object.defineProperty(Vue.prototype, "$route", {
    get() {
      return this._routerRoot._route;
    },
  });

  Vue.component("RouterView", View);
  Vue.component("RouterLink", Link);

  const strats = Vue.config.optionMergeStrategies;
  // use the same hook merging strategy for route hooks
  strats.beforeRouteEnter =
    strats.beforeRouteLeave =
    strats.beforeRouteUpdate =
      strats.created;
}
