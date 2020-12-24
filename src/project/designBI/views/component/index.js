import Vue from "vue";
import DesignItem from "@designBI/store/Entity/DesignItem";
import itemManager from "@designBI/views/drawer/itemManager";

// 【=1.1=】单个格子
import oneCell from "./layout/cells-map/one-cell.vue";
Vue.component("d-one-cell", oneCell);
//【=1.2=】格子表格
import cellsMap from "./layout/cells-map/cells-map.vue";
Vue.component("d-cells-map", cellsMap);

//---------
// 一、拖拽 组件
//---------
import Simple from "./base/simple.vue";
Vue.component("Simple", Simple);
itemManager.add(
  new DesignItem({
    xtype: "Simple",
    typeCode: "0102",
    name: "测试Simple组件",
    desp: "测试Simple组件，debug用",
    props: Simple.props,
    source_influence: [
      {
        slot: "slot1",
        desp: "slot1位置 当作字符串插入"
      },
      {
        slot: "slot2",
        desp: "slot2位置 当作字符串插入"
      },
      {
        slot: "slot1",
        desp: "slot2位置 当作字符串插入"
      }
    ],
    defaultValues: function() {
      return {
        style: {
          width: "20%",
          height: "30%"
        },
        source: {
          slot1: "默认值1",
          slot2: "默认值2"
        }
      };
    }
  })
);
import BaseBubble from "./base/BaseBubble.vue";
Vue.component("BaseBubble", BaseBubble);
itemManager.add(
  new DesignItem({
    xtype: "BaseBubble",
    typeCode: "0103",
    name: "容器",
    desp: "可加入子容器的容器，有父子级",
    props: BaseBubble.props,
    source_influence: "无source选项"
  })
);
import CellBubble from "./base/CellBubble.vue";
Vue.component("CellBubble", CellBubble);
itemManager.add(
  new DesignItem({
    xtype: "CellBubble",
    typeCode: "0104",
    name: "cell容器",
    desp: "加入AbsItems布局工具的基础容器",
    props: CellBubble.props,
    source_influence: "无source选项"
  })
);

//---------
// 二、公用组件
//---------
// 1、维度类型tag
import DimTypeTag from "./public/DimTypeTag.vue";
Vue.component("DimTypeTag", DimTypeTag);
