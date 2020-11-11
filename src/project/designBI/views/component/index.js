import Vue from "vue";

// 【=1.1=】单个格子
import oneCell from "./layout/cells-map/one-cell.vue";
Vue.component("d-one-cell", oneCell);
//【=1.2=】格子表格
import cellsMap from "./layout/cells-map/cells-map.vue";
Vue.component("d-cells-map", cellsMap);
