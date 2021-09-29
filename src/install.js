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


  // 混入组件选项
  Vue.mixin({
    // 在组件创建之前执行
    // todo 这个组件是 App.vue 吗=-=
    beforeCreate() {
      if (isDef(this.$options.router)) {
        this._routerRoot = this;
        this._router = this.$options.router;
        this._router.init(this);
        Vue.util.defineReactive(this, "_route", this._router.history.current);
      } else {
        this._routerRoot = (this.$parent && this.$parent._routerRoot) || this;
      }
      // 注册实例
      registerInstance(this, this);
    },
    destroyed() {
      // 销毁实例
      registerInstance(this);
    },
  });

  // Object.defineProperty() 直接在一个对象上定义一个新属性，或者修改一个对象的现有属性，并返回此对象
  // 在 Vue 的原型链上面挂了个 $router
  // 任何组件都可以直接通过 this.$router 访问路由器
  Object.defineProperty(Vue.prototype, "$router", {
    get() {
      return this._routerRoot._router;
    },
  });

  // 在 Vue 的原型链上面挂了个 $route
  // 可以通过 this.$route 访问当前路由
  Object.defineProperty(Vue.prototype, "$route", {
    get() {
      return this._routerRoot._route;
    },
  });

  // 挂载组件到 vue-router 插件上,后面插件安装之后,就能全局使用了
  // 路由出口，路由匹配到的组件将渲染在这里
  Vue.component("RouterView", View);
  Vue.component("RouterLink", Link);

  const strats = Vue.config.optionMergeStrategies;
  // use the same hook merging strategy for route hooks
  strats.beforeRouteEnter =
    strats.beforeRouteLeave =
    strats.beforeRouteUpdate =
      strats.created;
}
