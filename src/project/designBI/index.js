import Vue from "vue";
window.D = window.D || {}; //我的设计器总空间

import "./assets/theme/designBI_vue.scss";
//设计器所需 各个模块的引入

//【~ 1】完整引入 element看看
import ElementUI from "element-ui";
Vue.use(ElementUI);

//=========--------
// Section 1 环境框架构建
//=========--------
//【~ 1】store数据相关
import { theStore } from "./store";
import router from "./router";

//=========--------
// Section 2 前置部件
//=========--------
//【=1=】两个拖拽resize
import "@/packages/drag-resize";
import CusMsgBox from "@/packages/message-box";
Vue.prototype.$msgbox2 = CusMsgBox;
//【=2=】经典布局
import RectLayoutV2 from "../../plugins/vue/RectLayoutV2.vue";
Vue.component("RectLayoutV2", RectLayoutV2);

//=========--------
// Section 3 BI构成
//=========--------
import itemManager from "./views/drawer/itemManager";
Vue.$itemManager = itemManager;
//【1】BI基础元素
import "./views/drawer";
//【2】BI构成元素
import "./views/component";

//=========--------
// Section 4 BI页面 在上述材料准备好之后再引入
//=========--------
//import App from "./views/Page/App.vue";

new Vue({
  store: theStore,
  router: router,
  el: "#app"
});
