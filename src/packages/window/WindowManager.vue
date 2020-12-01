<template>
  <div class="WindowManager" v-if="false">
    <!-- <div v-for="item in items" :key="item.xtype" :is="item.xtype"></div> -->
  </div>
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
      count: 0,
      items: []
    };
  },
  methods: {
    //换种方式加入//不行
    // add_tags(windowExtend) {
    //   let me = this,
    //     id = me.count++,
    //     xtype = "windowExtend_" + id,
    //     item = {
    //       xtype,
    //     };
    //   console.log(["尝试", me, me.options]);
    //   //me.options.components[xtype] = windowExtend;
    //   Vue.component(xtype, windowExtend);
    //   setTimeout(() => {
    //     me.items.push(item);
    //   }, 1000);
    // },
    add(windowExtend) {
      let me = this,
        id = tool.uniqueStr(),
        addDiv = $(`<div id="${id}"></div>`),
        newWin = new windowExtend({
          store: theStore
        });
      $("body").append(addDiv);
      //~ 1 销毁
      // newWin.$on("close", ()=> {

      // });
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
