<template>
  <div class="echartsBox" ref="box" style="width: 100%; height: 100%;"></div>
</template>

<script>
import chartCommon from "./chartCommon";
export default {
  name: "chart-funnel",
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
      //# 2 一个funnel的配置
      return [
        {
          name: me.name,
          type: "funnel",
          data,
          left: "10%",
          top: 60,
          bottom: 60,
          width: "80%",
          minSize: "0%",
          maxSize: "100%",
          sort: "descending",
          gap: 2,
          label: {
            show: true,
            position: "inside"
          },
          itemStyle: {
            borderColor: "#fff",
            borderWidth: 1
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)"
            },
            label: {
              fontSize: 20
            }
          }
        }
      ];
    },
    option_funnel() {
      let me = this,
        option = {
          //# 2 小组件
          legend: { type: "scroll" },
          tooltip: {},

          //# 1 核心部分
          series: me.series
        };

      return option;
    },
    option() {
      return this.option_funnel;
    }
  }
};
</script>
