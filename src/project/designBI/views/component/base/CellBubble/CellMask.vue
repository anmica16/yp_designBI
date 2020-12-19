<template>
  <div class="Cellmask"></div>
</template>

<script>
//@@ 在拖拽 resize的时候 伴生于Bubble，作为一个独立的子控件，将Bubble此刻落下时可能的位置用阴影表达出来
export default {
  name: "Cellmask"
};
</script>

<style lang="scss">
.Cellmask {
  position: absolute;
  background: rgba(12, 65, 62, 0.349);
  z-index: 10;
  border: 1px solid rgba(12, 65, 62, 0.918);
  //border-radius: 8px;
}
</style>
