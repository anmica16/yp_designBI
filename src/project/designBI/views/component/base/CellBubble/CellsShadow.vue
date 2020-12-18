<template>
  <div class="shadow"></div>
</template>

<script>
//@@ 在拖拽 resize的时候 伴生于Bubble，作为一个独立的子控件，将Bubble此刻落下时可能的位置用阴影表达出来
export default {
  name: "CellsShadow"
};
</script>

<style lang="scss">
.shadow {
  position: absolute;
  background: rgba(12, 65, 62, 0.349);
  //border-radius: 8px;
}
</style>
