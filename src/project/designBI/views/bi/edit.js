import Vue from "vue";
import DesignItem from "@designBI/store/Entity/DesignItem";
import itemManager from "@designBI/views/drawer/itemManager";

import BIBase from "./BIBase.vue";
Vue.component("BIBase", BIBase);
itemManager.add(
  new DesignItem({
    xtype: "BIBase",
    typeCode: "02",
    name: "BI组件",
    desp: "debug用BI组件",
    props: BIBase.props
  })
);
