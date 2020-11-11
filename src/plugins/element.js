import Vue from "vue";
import "../element-variables.scss";

//【=隐藏=】
import ElScrollbar from "@/packages/scrollbar"; //"element-ui/packages/scrollbar";
Vue.use(ElScrollbar);

//【=0=】基本
import { Row, Col, Loading } from "element-ui";
Vue.use(Row);
Vue.use(Col);
Vue.use(Loading);

// //【=1=】表单
// import { Input, Button, Select, Option } from "element-ui";
// Vue.use(Input);
// Vue.use(Button);
// Vue.use(Select);
// Vue.use(Option);

// //【=2=】提示message
// import { Message, MessageBox } from "element-ui";
// Vue.prototype.$msgbox = MessageBox;
// Vue.prototype.$alert = MessageBox.alert;
// Vue.prototype.$confirm = MessageBox.confirm;
// Vue.prototype.$prompt = MessageBox.prompt;
// Vue.prototype.$message = Message;

// //【=3-1=】菜单 选择
// import { Menu, MenuItem, Submenu, MenuItemGroup } from "element-ui";
// Vue.use(Menu);
// Vue.use(MenuItem);
// Vue.use(Submenu);
// Vue.use(MenuItemGroup);
// //【=3-2=】悬浮一级菜单
// import { Dropdown, DropdownItem, DropdownMenu } from "element-ui";
// Vue.use(Dropdown);
// Vue.use(DropdownItem);
// Vue.use(DropdownMenu);

// //【=4=】大型部件
// import { Table, TableColumn } from "element-ui";
// Vue.use(Table);
// Vue.use(TableColumn);
// // --2 tab panel
// import { Tabs, TabPane } from "element-ui";
// Vue.use(Tabs);
// Vue.use(TabPane);
