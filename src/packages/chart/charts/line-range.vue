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
let echarts = require("echarts");
import barS from "./bar-stack";
export default {
  name: "chart-line-range",
  extends: barS,
  computed: {
    seriesType() {
      return "line";
    },
    series() {
      let me = this,
        series = [];
      me.Indices.forEach((index, i) => {
        let name =
            me._joinTables && me._joinTables.length ? index.tName : index.key,
          baseColor = me.themeColors[i % me.themeColors.length],
          s = {
            type: me.seriesType,
            name: name,
            stack: "总量",
            label: {
              show: true
            },
            emphasis: {
              focus: "series"
            },
            smooth: true,
            areaStyle: {
              opacity: 0.8,
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: echarts.color.lift(baseColor, -0.3)
                },
                {
                  offset: 1,
                  color: echarts.color.lift(baseColor, 0.3)
                }
              ])
            },
            encode: {
              x: me.Dims.length ? me.Dims[0].realKey : 0,
              y: name
            }
          };
        series.push(s);
      });
      return series;
    }
  }
};
</script>
