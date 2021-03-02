<template>
  <div class="ErrorPage">
    <div class="title">错误页</div>
    <div class="body">
      {{ errorMsg }}
    </div>
  </div>
</template>

<script>
export default {
  name: "Error",
  computed: {
    errorMsg() {
      let me = this;
      return me.$store.state.errorPageMsg;
    }
  }
};
</script>
