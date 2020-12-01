<template>
  <div class="boardArea">
    <!-- 新增用 -->
    <AttachBoard :isAdd="true"></AttachBoard>
    <template v-for="board in boards">
      <AttachBoard :key="board.templateMap" :Entity="board"></AttachBoard>
    </template>
  </div>
</template>

<script>
import tool from "@/plugins/js/tool";
import AttachBoard from "./AttachBoard";
export default {
  name: "DesignCenter",
  components: {
    AttachBoard
  },
  computed: {
    boards() {
      let me = this,
        list = [],
        map = this.$store.state.templateMap;
      tool.each(map, (key, val) => {
        list.push(val.board);
      });
      return list;
    }
  }
};
</script>

<style></style>
