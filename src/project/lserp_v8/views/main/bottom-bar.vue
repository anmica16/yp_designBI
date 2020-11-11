<template>
  <div class="bottom-bar">
    <div class="bottom-bar-inner">
      <MessageBar></MessageBar>
    </div>
  </div>
</template>

<script>
import MessageBar from "./message-tab";
export default {
  name: "bottom-bar",
  components: {
    MessageBar
  }
};
</script>
