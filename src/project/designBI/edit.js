import Vue from "vue";

let echarts = require("echarts");
window.echarts = echarts;

//=========--------
// Section 2 前置部件
//=========--------
import "@/packages/chart";

//=========--------
// Section 3 BI构成
//=========--------
import itemManager from "./views/drawer/itemManager";
Vue.$itemManager = itemManager;
//【1】BI基础元素
// import "./views/drawer";
//【2】BI构成元素
import "./views/component/edit";

import "./views/bi/edit";
