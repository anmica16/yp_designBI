<template>
  <div class="BaseBubble">
    <Bubble
      v-for="item in items"
      :key="item.getData(instanceCode)"
      :Entity="item"
    ></Bubble>
  </div>
</template>

<script>
import Entity from "@designBI/views/mixins/Entity.js";

export default {
  name: "BaseBubble",
  mixins: [Entity]
};
</script>

<style lang="scss">
//因为大小由外部控制，所以默认向外部靠齐
.BaseBubble {
  width: 100%;
  height: 100%;
}
</style>
