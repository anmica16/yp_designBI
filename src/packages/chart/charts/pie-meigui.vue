<template>
  <div class="echartsBoxWrap">
    <div
      v-show="hasDimension"
      class="echartsBox"
      ref="box"
      style="width: 100%; height: 100%;"
    ></div>

    <div v-show="!hasDimension" class="noDimensionTip">
      <div class="back"></div>
      <div class="text">请先进入修改界面添加维度指标</div>
    </div>
  </div>
</template>

<script>
import pie from "./pie";
export default {
  extends: pie,
  computed: {
    option() {
      let me = this,
        pieOption = me.option_pie;
      pieOption.series.forEach(s => {
        s.roseType = "radius";
      });
      return this.option_pie;
    }
  }
};
</script>
