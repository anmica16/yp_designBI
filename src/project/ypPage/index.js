import Vue from "vue";

import "./assets/theme/ypPage.scss";
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

//=========--------
// Section 1 环境框架构建
//=========--------
//【~ 1】store数据相关
//import { theStore } from "./store";
import router from "./assets/router";

new Vue({
  name: "DesignBI",
  //store: theStore,
  router: router,
  el: "#app"
});
