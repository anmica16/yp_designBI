<template>
  <div class="echartsBox" ref="box" style="width: 100%; height: 100%;"></div>
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
