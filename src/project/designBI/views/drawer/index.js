import Vue from "vue";
import DesignItem from "@designBI/store/Entity/DesignItem";
import itemManager from "@designBI/views/drawer/itemManager";

import Bubble from "./Bubble.vue";
Vue.component("Bubble", Bubble);
// itemManager.add(
//   new DesignItem({
//     xtype: "Bubble",
//     typeCode: "0101",
//     name: "基础容器",
//     desp:
//       "拖拽改变大小的基本容器，可传入任意的子控件实体作为宿主在其中，从而实现可拖拉拽的子控件",
//     props: Bubble.props,
//     source_influence: null
//   })
// );
