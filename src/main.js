import Vue from "vue";
//import "./plugins/element.js";

Vue.config.productionTip = false;

import VueExtend from "./plugins/VueExtend";
Vue.use(VueExtend);

//【~ 1】设计器所需
import "./project/designBI";

//【~ 2】lserp_v8 部件
//import "./project/lserp_v8";
