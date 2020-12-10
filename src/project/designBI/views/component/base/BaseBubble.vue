<template>
  <div class="BaseBubble">
    <Bubble
      v-for="item in items"
      :percentMode="percentMode"
      :key="item.recordData.instanceCode"
      :Entity="item"
    ></Bubble>
  </div>
</template>

<script>
import { Instance } from "@designBI/views/mixins/Entity.js";
//import tool from '@/plugins/js/tool';

export default {
  name: "BaseBubble",
  mixins: [Instance],
  props: {
    //【1210】百分比模式，仅作用于 水平方向上w l；传递下去
    percentMode: {
      type: Boolean,
      default: function() {
        return true;
      }
    }
  }
  // watch:{
  //   items(newVal) {
  //     if (newVal && newVal.length) {
  //     tool.each(newVal, item =>{
  //       item.set
  //     })

  //     }
  //   }
  // }
};
</script>

<style lang="scss">
//因为大小由外部控制，所以默认向外部靠齐
.BaseBubble {
  width: 100%;
  height: 100%;
}
</style>
