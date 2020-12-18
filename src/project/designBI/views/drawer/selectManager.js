import tool from "@/plugins/js/tool";
import $ from "jquery";
import Vue from "vue";

let selectManagerCfg = {
  name: "selectManager",
  data() {
    return {
      //# 1 hover对象 单个！
      hoverItem: null,
      hoverItem_old: null, //root记录
      //# 2 down的选择对象 均为单个！
      selectItem: null
    };
  },
  methods: {
    changeHover(bubble) {
      let me = this,
        oldItem = me.hoverItem_old;
      if (oldItem) {
        //oldItem.$emit("hover-off");
      }
      //# 2 针对root的情况，恢复上次选中情况
      if (bubble && bubble.isRoot) {
        if (oldItem && !oldItem.isRoot) {
          me.hoverItem = oldItem;
        }
      } else {
        //不存在
        if (!bubble && oldItem && oldItem.isRoot) {
          //不理会
        } else {
          me.hoverItem = bubble;
        }
      }
      if (bubble) {
        //bubble && bubble.$emit("hover-on");
        //# 1 标记old
        me.hoverItem_old = bubble;
      }
    },
    changeSelect(bubble) {
      let me = this,
        oldItem = me.selectItem;
      if (oldItem) {
        //oldItem.$emit("select-off");
      }
      me.selectItem = bubble;
      if (bubble) {
        //bubble.$emit("select-on");
        //# 1 针对root情况 同时清空hover到root
        if (bubble.isRoot) {
          me.hoverItem = bubble;
        }
      }
    } //changeSel
  }
};

let selectManagerCtor = Vue.extend(selectManagerCfg);
const selectManager = new selectManagerCtor();

export default selectManager;
