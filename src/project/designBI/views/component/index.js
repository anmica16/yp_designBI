import Vue from "vue";
import DesignItem from '@designBI/store/Entity/DesignItem';
import itemManager from '@designBI/views/drawer/itemManager';

// 【=1.1=】单个格子
import oneCell from "./layout/cells-map/one-cell.vue";
Vue.component("d-one-cell", oneCell);
//【=1.2=】格子表格
import cellsMap from "./layout/cells-map/cells-map.vue";
Vue.component("d-cells-map", cellsMap);

//---------
// 组件
//---------
import Simple from "./base/simple.vue";
Vue.component("Simple", Simple);
itemManager.add(new DesignItem({
  xtype: "Simple",
  typeCode: "0102",
  name: "测试Simple组件",
  desp: "测试Simple组件，debug用",
  props: Simple.props,
  source_influence: [{
    slot: "slot1",
    desp: "slot1位置 当作字符串插入",
  }, {
    slot: "slot2",
    desp: "slot2位置 当作字符串插入",
  }, {
    slot: "slot1",
    desp: "slot2位置 当作字符串插入",
  }]
}));
