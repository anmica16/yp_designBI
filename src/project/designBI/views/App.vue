<template>
  <div class="BI-application-page">
    <transition name="fade">
      <div class="progressBar-wrap" v-show="progressShow">
        <div
          class="progressBar"
          :class="{ fullfilled: !progressShow }"
          :style="progressStyle"
        ></div>
      </div>
    </transition>
    <router-view></router-view>
    <WindowManager></WindowManager>
  </div>
</template>

<script>
import Vue from "vue";
import WindowManager from "@/packages/window/WindowManager.vue";
import tool from "@/plugins/js/tool";
export default {
  name: "BI-application-page",
  components: {
    WindowManager
  },
  data() {
    return {
      progressShow: false
    };
  },
  computed: {
    //@ 1 进度条
    progress() {
      let me = this,
        val = me.$store.state.progress;

      return val === null ? 100 : val;
    },
    // progressShow() {
    //   return tool.isNumber(this.progress);
    // },
    progressStyle() {
      let me = this,
        style = {};
      if (me.progressShow) {
        tool.apply(style, {
          width: me.progress + "%"
        });
      }

      return style;
    }
  },
  watch: {
    //# 4 store 进度条监听
    "$store.state.progress": function(newVal, oldVal) {
      let me = this;
      //console.log(["能顾监听progress变化", newVal, oldVal]);
      if (newVal === 100 || newVal < 0 || newVal > 100) {
        me.progressShow = false;
        me.$store.state.progress = null;
      } else if (tool.isNumber(newVal) && newVal < 100) {
        me.progressShow = true;
      }
    }
  },
  created() {
    let me = this;
    me.$store.dispatch("getBoardsInDB");
    console.log(["app对象", me]);
    Vue.$root = me;
  }
};
</script>

<style lang="scss">
.BI-application-page {
  position: relative;
  .progressBar-wrap {
    position: absolute;
    top: 0;
    left: 0;
    height: 4px;
    width: 100%;

    .progressBar {
      height: 100%;
      transition: all 0.5s;
      background: goldenrod;
      &.fullfilled {
        transition: none;
      }
    }
  }
}
</style>
