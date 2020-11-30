import Vue from "vue";

//-------
// 工具
import CusForm from "./Maker_tools/CusForm.vue";
Vue.component("CusForm", CusForm);

import CusFormItem from "./Maker_tools/CusFormItem.vue";
Vue.component("CusFormItem", CusFormItem);

//-----------
// maker
import Maker_DrawingBoard from "./Maker_DrawingBoard.vue";
Vue.component("Maker_DrawingBoard", Maker_DrawingBoard);

import Maker_Entity from "./Maker_Entity.vue";
Vue.component("Maker_Entity", Maker_Entity);
