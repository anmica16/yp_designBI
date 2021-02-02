<template>
  <div class="echartsBox" ref="box" style="width: 100%; height: 100%;"></div>
</template>

<script>
import chartCommon from "./chartCommon";
export default {
  name: "chart-pie",
  mixins: [chartCommon],
  computed: {
    series() {
      let me = this,
        data = [];
      //# 1 数据
      if (me.Indices && me.Indices.length && me.Dims && me.Dims.length) {
        let index = me.Indices[0],
          dim = me.Dims[0];
        me.keySheet.forEach(rec => {
          data.push({
            name: rec[dim.realKey],
            value: rec[index.realKey]
          });
        });
      }
      //# 2 一个圆饼的配置
      return [
        {
          name: me.name,
          type: "pie",
          radius: ["40%", "70%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: "#fff",
            borderWidth: 2
          },
          data,
          center: ["40%", "50%"],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)"
            }
          }
        }
      ];
    },
    option_pie() {
      let me = this,
        option = {
          //# 2 小组件
          legend: {
            type: "scroll",
            orient: "vertical",
            right: 10,
            top: 20,
            bottom: 20
          },
          tooltip: {
            // trigger: "item",
            formatter: "{a} <br/>{b} : <strong>{c}</strong> ({d}%)"
          },

          //# 1 核心部分
          series: me.series
        };

      return option;
    },
    option() {
      return this.option_pie;
    }
  }
};
</script>
