<template>
  <div class="BI-application-page">
    <router-view></router-view>
    <WindowManager></WindowManager>
  </div>
</template>

<script>
import Vue from "vue";
import WindowManager from "@/packages/window/WindowManager.vue";
export default {
  name: "BI-application-page",
  components: {
    WindowManager
  },
  created() {
    let me = this;
    me.$store.dispatch("getBoardsInDB");
    console.log(["app对象", me]);
    Vue.$root = me;
  }
};
</script>
