import Vue from "vue";
//import "./plugins/element.js";

Vue.config.productionTip = false;

//## 1 首先我们对Vue 增加一些公用的功能性属性和方法：
import VueExtend from "./plugins/VueExtend";
Vue.use(VueExtend);

//【~ 1】设计器所需
//import "./project/designBI";

//【~ 2】lserp_v8 部件
//import "./project/lserp_v8";

//【~ 3】个人博客
import "./project/ypPage";
