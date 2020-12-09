import Vue from "vue";
window.D = window.D || {}; //我的设计器总空间

import "./assets/theme/designBI_vue.scss";
//设计器所需 各个模块的引入

//【~ 1】完整引入 element看看
import ElementUI from "element-ui";
Vue.use(ElementUI);

// //【=2=】提示message
import { Message, MessageBox } from "element-ui";
Vue.$msgbox = MessageBox;
Vue.$alert = MessageBox.alert;
Vue.$confirm = MessageBox.confirm;
Vue.$prompt = MessageBox.prompt;
Vue.$message = Message;
// import "element-ui/packages/theme-chalk/src/message-box.scss";
// import "element-ui/packages/theme-chalk/src/message.scss";

//# 1 滚动条
import Scrollbar from "@/packages/scrollbar/src/main.js"; //"element-ui/packages/scrollbar";
Vue.component("Scrollbar", Scrollbar);
//import "element-ui/packages/theme-chalk/src/scrollbar.scss";
//# 2 分页
import Pager from '@/packages/pager';
Vue.component("Pager", Pager);

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
//【=3=】Window
import Window from "@/packages/window/Window.vue";
Vue.component("Window", Window);

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
