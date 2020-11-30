<template>
  <div class="WindowManager"></div>
</template>

<script>
import tool from "@/plugins/js/tool";
import $ from "jquery";
import Vue from "vue";
import { theStore } from "@designBI/store";
export default {
  name: "WindowManager",
  data() {
    return {
      queryFlag: "WindowManager",
      items: []
    };
  },
  methods: {
    add(windowExtend) {
      let me = this,
        id = tool.uniqueStr(),
        addDiv = $(`<div id="${id}"></div>`),
        newWin = new windowExtend({
          store: theStore
        });
      $(me.$el).append(addDiv);
      //~ 1 销毁
      newWin.$on("close", function(callback) {
        tool.isFunction(callback) && callback();
        newWin.$destroy();
      });
      //~ 2 加入
      me.items.push(newWin);
      newWin.$mount(addDiv[0]);
      return newWin;
    }
  },
  created() {
    let me = this;
    Vue.$windowManager = me;
  }
};
</script>

<style></style>
