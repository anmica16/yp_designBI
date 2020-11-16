import Vue from "vue";

import ElScrollbar from "@/packages/scrollbar"; //"element-ui/packages/scrollbar";
Vue.use(ElScrollbar);
import "element-ui/packages/theme-chalk/src/scrollbar.scss";

import { Button, Loading, Popover } from "element-ui";
Vue.use(Loading);
Vue.use(Popover);
Vue.use(Button);
import "element-ui/packages/theme-chalk/src/loading.scss";
import "element-ui/packages/theme-chalk/src/popover.scss";
import "element-ui/packages/theme-chalk/src/button.scss";

// //【=2=】提示message
import { Message, MessageBox } from "element-ui";
Vue.prototype.$msgbox = MessageBox;
Vue.prototype.$alert = MessageBox.alert;
Vue.prototype.$confirm = MessageBox.confirm;
Vue.prototype.$prompt = MessageBox.prompt;
Vue.prototype.$message = Message;
import "element-ui/packages/theme-chalk/src/message-box.scss";
import "element-ui/packages/theme-chalk/src/message.scss";

//【=4=】大型部件
import { Table, TableColumn } from "element-ui";
Vue.use(Table);
Vue.use(TableColumn);
import "element-ui/packages/theme-chalk/src/table.scss";
import "element-ui/packages/theme-chalk/src/table-column.scss";

//放后面
import "./theme/theme.scss";

import "./views/main";
import "./views/modules";
