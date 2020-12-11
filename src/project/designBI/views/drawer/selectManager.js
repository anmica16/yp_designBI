import tool from "@/plugins/js/tool";
import $ from "jquery";
import Vue from "vue";

let selectManagerCfg = {
  name: "selectManager",
  data() {
    return {
      //# 1 hover对象 单个！
      hoverItem: null,
      //# 2 down的选择对象 均为单个！
      selectItem: null
    };
  },
  methods: {
    changeHover(bubble) {
      let me = this,
        oldItem = me.hoverItem;
      if (oldItem) {
        oldItem.$emit("hover-off");
      }
      me.hoverItem = bubble;
      bubble && bubble.$emit("hover-on");
    },
    changeSelect(bubble) {
      let me = this,
        oldItem = me.selectItem;
      if (oldItem) {
        oldItem.$emit("select-off");
      }
      me.selectItem = bubble;
      bubble && bubble.$emit("select-on");
    }
  }
};

let selectManagerCtor = Vue.extend(selectManagerCfg);
const selectManager = new selectManagerCtor();

export default selectManager;
