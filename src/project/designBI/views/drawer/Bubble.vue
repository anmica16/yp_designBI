<template>
  <DragResizeDom>
    <div
      class="test"
      style="width: 100%; height: 100%; background: blue"
      @mousedown.stop="mousedownFn"
    >
      测试区域
    </div>
  </DragResizeDom>
</template>

<script>
import DesignItem from "@designBI/store/Entity/DesignItem.js";
import DesignItemInstance from "@designBI/store/Entity/DesignItemInstance";
//像一个泡泡一样，可以到处移动，也可以拖拽等
export default {
  name: "Bubble",
  methods: {
    mousedownFn() {
      console.log(["mousedownFn执行"]);
    },
  },
};
</script>

<style>
</style>