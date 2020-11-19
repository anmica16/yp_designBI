<template>
  <div class="Maker_DrawingBoard">
    <div class="itemArea"></div>
    <div class="maker-trigger">+</div>
  </div>
</template>

<script>
import tool from "@/plugins/js/tool";
import DrawingBoard from "../Entity/DrawingBoard";
export default {
  name: "Maker_DrawingBoard",
  props: {
    record: Object
  },
  data() {
    return {
      board: null
    };
  },
  computed: {
    formItems() {
      let me = this,
        items = [];
      if (!me.board) {
        return;
      }
      tool.each(me.board.record, (key, val) => {
        items.push(tool.apply({ $key: key }, val));
      });

      return items;
    }
  },
  mounted() {
    let me = this;
    me.board = new DrawingBoard(me.record);
  }
};
</script>
