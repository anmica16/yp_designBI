<template>
  <div class="BI-application-page">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: "BI-application-page",
  created() {
    let me = this;
    me.$store.dispatch("refresh_DrawingBoard_records");
  }
};
</script>
